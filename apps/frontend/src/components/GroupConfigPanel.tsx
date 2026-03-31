import { useState } from 'react';

type Group = { id: string; name: string; isPinned: boolean; defaultReply?: string };

export function GroupConfigPanel({
  groups,
  onSave
}: {
  groups: Group[];
  onSave: (groupId: string, defaultReply: string) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <section>
      <h2>Group Config</h2>
      {groups.length === 0 ? <p>No groups loaded.</p> : null}
      {groups.map((group) => (
        <form
          key={group.id}
          onSubmit={async (event) => {
            event.preventDefault();
            await onSave(group.id, drafts[group.id] ?? group.defaultReply ?? '');
          }}
        >
          <p>{group.name}</p>
          <input
            value={drafts[group.id] ?? group.defaultReply ?? ''}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [group.id]: event.target.value }))
            }
          />
          <button type="submit">Save Reply</button>
        </form>
      ))}
    </section>
  );
}
