"use client";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function StudentBulkDelete(props) {
  return <DeleteConfirmModal kind="students" {...props} />;
}

export default StudentBulkDelete;
