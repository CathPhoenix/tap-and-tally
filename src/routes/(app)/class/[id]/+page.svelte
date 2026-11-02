<!--
  A Class's own page: its name (click to rename), its students and their week across
  the full width, then its Menu. Start class opens Live Mode; the ⋯ menu holds Delete.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
  import EditableTitle from "$lib/components/EditableTitle.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import MoreMenu from "$lib/components/MoreMenu.svelte";
  import StudentTable from "$lib/components/StudentTable.svelte";
  import { activeBehaviors } from "$lib/domain/menus";
  import { startClass } from "$lib/startClass";
  import { store } from "$lib/store.svelte";

  const cls = $derived(store.findClass(page.params.id!)!);
  const menu = $derived(store.findMenu(cls.menuId));
  let deleting = $state(false);

  // The Class Note: one reminder for the whole class, edited in place.
  let noteDraft = $state<string | null>(null);

  function saveNote(event: SubmitEvent) {
    event.preventDefault();
    store.updateClass(cls.id, { note: noteDraft?.trim() || undefined });
    noteDraft = null;
  }
</script>

<svelte:head><title>{cls.name} · Tap &amp; Tally</title></svelte:head>

<div class="page wide stack">
  <header class="row head">
    <EditableTitle value={cls.name} onchange={(name) => store.updateClass(cls.id, { name })} label="Class name" />
    <span class="spacer"></span>
    <button class="btn btn-primary" onclick={() => startClass(cls.id)}><Icon name="play" size={16} /> Start class</button>
    <MoreMenu label="Class actions" actions={[{ label: "Delete class…", danger: true, onclick: () => (deleting = true) }]} />
  </header>

  {#if noteDraft !== null}
    <form class="class-note stack" onsubmit={saveNote}>
      <label>
        <span class="note-label">Class note</span>
        <!-- svelte-ignore a11y_autofocus -->
        <textarea
          rows="3"
          bind:value={noteDraft}
          autofocus
          placeholder="A reminder for this class, e.g. Monday: collect permission slips"
        ></textarea>
      </label>
      <div class="row">
        <span class="spacer"></span>
        <button type="button" class="btn btn-quiet" onclick={() => (noteDraft = null)}>Cancel</button>
        <button class="btn btn-primary">Save note</button>
      </div>
    </form>
  {:else if cls.note}
    <div class="class-note" role="note">
      <span class="note-label">Class note</span>
      <p class="note-text">{cls.note}</p>
      <div class="row">
        <span class="spacer"></span>
        <button class="btn btn-small" onclick={() => (noteDraft = cls.note ?? "")}><Icon name="edit" size={15} /> Edit</button>
        <button class="btn btn-small" onclick={() => store.updateClass(cls.id, { note: undefined })}>Clear</button>
      </div>
    </div>
  {:else}
    <div>
      <button class="btn btn-small" onclick={() => (noteDraft = "")}>+ Add class note</button>
    </div>
  {/if}

  <div class="columns">
    <section class="card stack">
      <StudentTable {cls} />
    </section>

    <section class="card stack menu-card">
      <h2>Menu</h2>
      <p class="muted small">What pops up when you tap a student in this class.</p>
      <label>
        <span class="sr-only">Menu</span>
        <select value={cls.menuId} onchange={(e) => store.updateClass(cls.id, { menuId: e.currentTarget.value })}>
          {#each store.data.menus as m (m.id)}<option value={m.id}>{m.name}</option>{/each}
        </select>
      </label>
      {#if menu}
        <ul class="behaviors">
          {#each activeBehaviors(menu) as behavior (behavior.id)}
            <li style="background: {behavior.color}">
              <span class="emoji">{behavior.emoji}</span>
              <span class="name">{behavior.name}</span>
              <span class="kind" title={behavior.mode === "toggle" ? "On or off for the day" : "Counts every tap"}>
                <Icon name={behavior.mode === "toggle" ? "toggle" : "count"} size={15} />
              </span>
            </li>
          {/each}
        </ul>
        <a class="btn btn-small" href="/menus/{menu.id}"><Icon name="edit" size={15} /> Edit this menu</a>
      {/if}
    </section>
  </div>
</div>

<ConfirmDialog
  bind:open={deleting}
  title="Delete {cls.name}?"
  message="Its students and every tap they have will be gone for good. Download a backup first if you might want them."
  confirm="Delete class"
  danger
  onconfirm={async () => {
    // Leave the page first, so nothing tries to show a class that's gone.
    const id = cls.id;
    const next = store.data.classes.find((c) => c.id !== id);
    await goto(next ? `/class/${next.id}` : "/setup");
    store.deleteClass(id);
  }}
/>

<style>
  .wide {
    max-width: 1180px;
  }

  .head {
    align-items: center;
  }

  .columns {
    display: grid;
    gap: 1.25rem;
  }

  .menu-card h2,
  .menu-card p {
    margin: 0;
  }

  .behaviors {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .behaviors li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 10px;
    font-weight: 800;
  }

  .emoji {
    font-size: 1.3rem;
  }

  .name {
    flex: 1;
    white-space: nowrap;
  }

  .kind {
    display: grid;
    place-items: center;
    color: rgb(46 34 25 / 0.55);
  }

  .class-note {
    display: grid;
    gap: 0.4rem;
    padding: 0.9rem 1.1rem;
    border: 1px solid var(--sun);
    border-left: 6px solid var(--sun);
    border-radius: var(--radius);
    background: #fff6dc;
    color: #2e2219;
  }

  .class-note label {
    display: grid;
    gap: 0.4rem;
  }

  .note-label {
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #7a5a1a;
  }

  .note-text {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    white-space: pre-wrap;
  }

  .class-note textarea {
    font-size: 1.05rem;
  }

  .menu-card .btn {
    justify-self: start;
  }

</style>
