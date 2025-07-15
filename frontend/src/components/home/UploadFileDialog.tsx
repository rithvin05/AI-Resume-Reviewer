"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// 
export function UploadFileDialog({
  file,
  setFile,
  isSaved,
  setIsSaved,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  isSaved: boolean;
  setIsSaved: (v: boolean) => void;
}) {
  const [tempFile, setTempFile] = useState<File | null>(null);

  const handleSave = () => {
    if (!tempFile) return alert("Please select a file first!");
    setFile(tempFile);
    setIsSaved(true);
  };

  const handleCancel = () => {
    setTempFile(null); // Clear the temporary file on cancel
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {file ? "₊✩‧ Resume Uploaded ‧✩₊" : "Upload Resume"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {file ? "Replace Resume" : "Upload Resume"}
            </DialogTitle>
            <DialogDescription>
              Choose a resume to analyze — it will be saved for submission.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full">
            <label
              htmlFor="file"
              className="block w-full cursor-pointer border px-4 py-2 rounded-md bg-white text-sm text-gray-700 shadow-sm border-gray-300"
            >
              <span className="font-semibold">Choose File</span>{" "}
              {tempFile
                ? tempFile.name
                : isSaved && file
                ? file.name
                : "No file chosen"}
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) {
                  setTempFile(selected);
                }
              }}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <div className="mt-6 flex w-full justify-end gap-4">
              <DialogClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button type="submit" onClick={handleSave} disabled={!tempFile}>
                  Save
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
