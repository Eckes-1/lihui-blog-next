
import { redirect } from "next/navigation";

export default function NewPostRedirect() {
    redirect("/admin/editor/new");
}
