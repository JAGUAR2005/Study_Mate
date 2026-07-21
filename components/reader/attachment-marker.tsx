import type { StudyAction } from "@/types/study";

const iconByAction: Record<StudyAction, string> = { define: "⌑", translate: "文", visualize: "⌘", note: "▤" };
const labelByAction: Record<StudyAction, string> = { define: "Definition", translate: "Translation", visualize: "Visual map", note: "Study note" };

export function AttachmentMarker({ actions, onOpen }: { actions: StudyAction[]; onOpen: (action: StudyAction) => void }) {
  if (!actions.length) return null;
  return <span className="attachment-marker-wrap">
    <span className="attachment-stem" aria-hidden="true" />
    <span className="attachment-marker">
      {actions.map((action) => <button type="button" key={action} className={`attachment-icon attachment-${action}`} onClick={() => onOpen(action)} aria-label={`Open attached ${labelByAction[action]}`} title={labelByAction[action]}>{iconByAction[action]}</button>)}
      <span className="attachment-count" aria-hidden="true">{actions.length}</span>
    </span>
    <span className="sr-only">{actions.length} study aids attached to this passage.</span>
  </span>;
}

export const attachmentIcon = iconByAction;
