import { auth } from "@clerk/nextjs/server";
import Editor from "@/components/Editor";

export default async function EditorPage() {
  const { userId } = await auth(); // yeh ab server import se aata hai
  if (!userId) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Login required</h2>
        <a href="/">
          <button>Go to home</button>
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Editor (Protected)</h1>
      <Editor docId="temp-id-123" />
    </div>
  );
}
