const API_URL = 'http://192.168.1.10:3000';

export async function fetchNotes() {
  const res = await fetch(`${API_URL}/notes`);
  return res.json();
}

export async function fetchArchivedNotes() {
  const res = await fetch(`${API_URL}/notes/archived`);
  return res.json();
}

export async function createNote(note) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  return res.text();
}

export async function updateNote(id, note) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  return res.text();
}

export async function deleteNote(id) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  return res.text();
}

export async function archiveNote(id) {
  const res = await fetch(`${API_URL}/notes/archive/${id}`, {
    method: 'PUT',
  });
  return res.text();
}
