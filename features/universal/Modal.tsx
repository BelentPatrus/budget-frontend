export function Modal(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div className="font-semibold">{props.title}</div>
          <button onClick={props.onClose} className="rounded-lg px-2 py-1 hover:bg-gray-100">
            ✕
          </button>
        </div>
        <div className="p-4">{props.children}</div>
      </div>
    </div>
  );
}