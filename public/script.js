async function loadFolders() {
  const res = await fetch('/api/folders');
  const folders = await res.json();
  const container = document.getElementById('folders');
  container.innerHTML = '';

  folders.forEach(f => {
    const div = document.createElement('div');
    div.className = 'folder';
    div.innerHTML = `
      <h2>${f.name}</h2>
      <p>${f.description || ''}</p>
      <form onsubmit="uploadFile(event, '${f.name}')">
        <input type="file" name="file" required>
        <button type="submit">Enviar Imagem</button>
      </form>
      <div class="images">
        ${(f.files || []).map(file => `<img src="${file}" width="100">`).join('')}
      </div>
    `;
    container.appendChild(div);
  });
}

async function createFolder() {
  const name = document.getElementById('folderName').value;
  if (!name) return alert('Digite um nome!');
  await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('folderName').value = '';
  loadFolders();
}

async function uploadFile(event, folderName) {
  event.preventDefault();
  const formData = new FormData(event.target);
  await fetch(`/api/upload/${folderName}`, {
    method: 'POST',
    body: formData
  });
  loadFolders();
}

loadFolders();
