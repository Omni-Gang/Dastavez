"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const utils_1 = require("y-websocket/bin/utils");
const Y = __importStar(require("yjs"));
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
// Document storage - in production, use Redis or GraphQL for persistence
// Here we use in-memory storage for simplicity
const documents = new Map();
const documentMetadata = new Map();
const app = (0, express_1.default)();
// Enable CORS for all routes
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Add your frontend URLs
    credentials: true,
}));
app.use(express_1.default.json());
// REST API endpoints
app.get("/api/documents", (req, res) => {
    const docs = Array.from(documentMetadata.entries()).map(([id, metadata]) => ({
        id,
        title: metadata.title,
        lastModified: metadata.lastModified,
        collaboratorCount: metadata.collaborators.size,
    }));
    res.json(docs);
});
app.get("/api/documents/:docId", (req, res) => {
    const { docId } = req.params;
    const metadata = documentMetadata.get(docId);
    if (!metadata) {
        return res.status(404).json({ error: "Document not found" });
    }
    res.json({
        id: docId,
        title: metadata.title,
        lastModified: metadata.lastModified,
        collaboratorCount: metadata.collaborators.size,
    });
});
app.post("/api/documents", (req, res) => {
    const docId = (0, uuid_1.v4)();
    const { title = "Untitled Document" } = req.body;
    // Create new Y.Doc
    const ydoc = new Y.Doc();
    documents.set(docId, ydoc);
    // Initialize metadata
    documentMetadata.set(docId, {
        title,
        lastModified: new Date(),
        collaborators: new Set(),
    });
    res.json({
        id: docId,
        title,
        url: `${req.protocol}://${req.get("host")}/doc/${docId}`,
    });
});
app.put("/api/documents/:docId/title", (req, res) => {
    const { docId } = req.params;
    const { title } = req.body;
    const metadata = documentMetadata.get(docId);
    if (!metadata) {
        return res.status(404).json({ error: "Document not found" });
    }
    metadata.title = title;
    metadata.lastModified = new Date();
    res.json({ success: true });
});
app.delete("/api/documents/:docId", (req, res) => {
    const { docId } = req.params;
    if (!documents.has(docId)) {
        return res.status(404).json({ error: "Document not found" });
    }
    // Cleanup document
    const ydoc = documents.get(docId);
    if (ydoc) {
        ydoc.destroy();
    }
    documents.delete(docId);
    documentMetadata.delete(docId);
    res.json({ success: true });
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        documents: documents.size,
        uptime: process.uptime(),
    });
});
const server = http.createServer(app);
const wss = new ws_1.default.Server({ server });
// Enhanced WebSocket connection handler
wss.on("connection", (ws, req) => {
    const url = req.url || "";
    const docName = url.slice(1).split("?")[0] || "default-room";
    console.log(`📝 New connection to document: ${docName}`);
    // Ensure document exists
    if (!documents.has(docName)) {
        const ydoc = new Y.Doc();
        documents.set(docName, ydoc);
        // Initialize metadata if it doesn't exist
        if (!documentMetadata.has(docName)) {
            documentMetadata.set(docName, {
                title: "Untitled Document",
                lastModified: new Date(),
                collaborators: new Set(),
            });
        }
    }
    // Add to collaborators
    const metadata = documentMetadata.get(docName);
    if (metadata) {
        const collaboratorId = (0, uuid_1.v4)();
        metadata.collaborators.add(collaboratorId);
        // Remove collaborator on disconnect
        ws.on("close", () => {
            metadata.collaborators.delete(collaboratorId);
            console.log(`👋 User left document: ${docName}`);
        });
    }
    // Set up Y.js WebSocket connection with persistence
    try {
        const ydoc = documents.get(docName);
        if (ydoc) {
            (0, utils_1.setupWSConnection)(ws, req, {
                docName,
                doc: ydoc, // Pass existing document
            });
            // Update last modified timestamp when document changes
            ydoc.on("update", () => {
                const metadata = documentMetadata.get(docName);
                if (metadata) {
                    metadata.lastModified = new Date();
                }
            });
        }
        else {
            (0, utils_1.setupWSConnection)(ws, req, { docName });
        }
    }
    catch (error) {
        console.error("Error setting up WebSocket connection:", error);
        ws.close();
    }
});
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server...");
    // Close all WebSocket connections
    wss.clients.forEach((ws) => {
        ws.close();
    });
    // Destroy all documents
    documents.forEach((doc) => {
        doc.destroy();
    });
    server.close(() => {
        console.log("✅ Server closed gracefully");
        process.exit(0);
    });
});
// Error handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running at ws://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
exports.default = server;
