import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { SharedPhotoLibraryManager } from "./shared-photo-library-manager";
import { isSharedPhotoLibraryOwner } from "../shared-photo-library-server";

export const dynamic = "force-dynamic";

export default async function SharedPhotoLibraryAdminPage() {
  const user = await requireChatGPTUser("/admin");

  if (!(await isSharedPhotoLibraryOwner(user))) {
    return (
      <main className="shared-library-shell">
        <section className="shared-library-window retro-window">
          <div className="window-title">SHARED PHOTO LIBRARY <span>MANAGER</span></div>
          <div className="shared-library-body">
            <h1>Library manager unavailable</h1>
            <p>This signed-in account does not have permission to publish the shared photo library.</p>
            <Link className="shared-library-link" href="/">RETURN TO LESSON PLANNER</Link>
          </div>
        </section>
      </main>
    );
  }

  return <SharedPhotoLibraryManager />;
}
