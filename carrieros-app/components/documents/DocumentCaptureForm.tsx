import { captureLoadDocumentAction } from "@/app/documents/actions";
import SelectField from "@/components/forms/SelectField";
import { LOAD_DOCUMENT_SEQUENCE } from "@/lib/types";

type DocumentCaptureFormProps = {
  loadId: string;
};

export default function DocumentCaptureForm({ loadId }: DocumentCaptureFormProps) {
  const documentOptions = LOAD_DOCUMENT_SEQUENCE.map((item) => ({
    value: item.type,
    label: item.label,
  }));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <p className="text-sm font-semibold text-blue-400">Capture / Upload</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          Add BOL, POD, lumper, invoice, or check image
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Alpha uses a file upload/mock capture flow. Transpo.ai converts it into
          a clean scanned document record for the packet.
        </p>
      </div>

      <form
        action={captureLoadDocumentAction.bind(null, loadId)}
        className="mt-6 grid gap-5"
      >
        <SelectField
          label="Document Type"
          name="type"
          options={documentOptions}
          placeholder="Select document type"
          required
        />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-300">
            Upload or Mock Capture
          </span>
          <input
            type="file"
            name="file"
            accept="image/*,.pdf"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-300">
            Mock File Name
          </span>
          <input
            name="fileName"
            placeholder="final-pod-photo.jpg"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
          />
        </label>

        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-5">
          <p className="text-sm font-semibold text-zinc-100">Scan Preview Mock</p>
          <p className="mt-2 text-sm text-zinc-400">
            Cropped edges, deskewed image, contrast cleaned, saved as packet-ready
            scanned record. OCR will be added later.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Capture Document
        </button>
      </form>
    </section>
  );
}
