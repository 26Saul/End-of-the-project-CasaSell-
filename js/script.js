
const STORAGE_KEY = "casas";

function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error parseando casas:", err);
    return [];
  }
}

function saveProducts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("storage"));
}

function generateId() {
  return 'p-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

function escapeHtml(text) {
  if (text == null) return '';
  return String(text).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

(function setupScrollButton() {
  const btn = document.querySelector('.cta-button');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const section = document.getElementById('house');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
})();

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-contacts");
    const errorsEl = document.getElementById("errors");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const message = document.getElementById("message").value.trim();

        let errors = [];
        if (name.length < 3) errors.push("Nombre inválido");
        const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!patronEmail.test(email)) errors.push("Email inválido");
        const patronTelefono = /^[0-9]{7,14}$/;
        if (!patronTelefono.test(phone)) errors.push("Teléfono inválido");
        if (message.length < 10) errors.push("Mensaje inválido");

        if (errors.length > 0) {
            errorsEl.textContent = errors.join(" | ");
            return;
        }

        let contactos = JSON.parse(localStorage.getItem("contactos") || "[]");
        contactos.push({ name, email, phone, message });
        localStorage.setItem("contactos", JSON.stringify(contactos));

        window.location.href = "contacts.html"; 
    })
});
document.addEventListener("DOMContentLoaded", () => {
        const contactList = document.getElementById("contact-list");

        const contactos = JSON.parse(localStorage.getItem("contactos") || "[]");

        if (contactos.length === 0) {
            contactList.innerHTML = "<p>No hay contactos registrados.</p>";
            return;
        }

        contactos.forEach(c => {
            const li = document.createElement("li");
            li.className = "contact-card";
            li.innerHTML = `
                <h3>${c.name}</h3>
                <p>Email: ${c.email}</p>
                <p>Teléfono: ${c.phone}</p>
                <p>Mensaje: ${c.message}</p>
            `;
            contactList.appendChild(li);
        });
    });

(function setupLightbox() {

  document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const thumbnails = Array.from(document.querySelectorAll('.house-card img'));

    if (!lightboxImg || !closeBtn || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    function openAt(index) {
      const img = thumbnails[index];
      if (!img) return;
      currentIndex = index;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function showPrev() {
      if (thumbnails.length === 0) return;
      currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
      openAt(currentIndex);
    }

    function showNext() {
      if (thumbnails.length === 0) return;
      currentIndex = (currentIndex + 1) % thumbnails.length;
      openAt(currentIndex);
    }

    document.querySelectorAll('.img-btn').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAt(i);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    document.addEventListener('keydown', (e) => {
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
      }
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  });
})();

function renderIndexList() {
  const listContainer = document.getElementById("product-list");
  if (!listContainer) return;

  const productos = getProducts();
  listContainer.innerHTML = "";

  if (!productos || productos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay viviendas guardados.";
    listContainer.appendChild(li);
    return;
  }

  productos.forEach(prod => {
    const li = document.createElement("li");
    li.className = "crud-item";
    li.innerHTML = `
      <img src="${escapeHtml(prod.imagen || '')}" class="crud-img" alt="${escapeHtml(prod.nombre || '')}">
      <div>
        <strong>${escapeHtml(prod.nombre)}</strong><br>
        ${prod.precio ? escapeHtml(prod.precio) + '€' : '-'}
      </div>
    `;
    listContainer.appendChild(li);
  });
}

function setupManagement() {
  const form = document.getElementById("manage-form");
  if (!form) return;

  const listEl = document.getElementById("product-list");
  const inputId = document.getElementById("prod-id");
  const nameInput = document.getElementById("prod-name-input");
  const priceInput = document.getElementById("prod-price-input");
  const catInput = document.getElementById("prod-cat-input");
  const descInput = document.getElementById("prod-desc-input");
  const imgInput = document.getElementById("prod-img-input");
  const feedback = document.getElementById("manage-feedback");
  const titleEl = document.getElementById("title");

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderManagementList() {
    const productos = getProducts();
    listEl.innerHTML = "";

    if (!productos || productos.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No hay viviendas disponibles.";
      listEl.appendChild(li);
      return;
    }


    productos.forEach(prod => {
      const li = document.createElement("li");
      li.className = "crud-item";
      li.innerHTML = `
        <img src="${escapeHtml(prod.imagen || '')}" class="crud-img" alt="${escapeHtml(prod.nombre || '')}">
        <div>
          <strong>${escapeHtml(prod.nombre)}</strong><br>
          ${prod.precio ? escapeHtml(prod.precio) + ' €' : '-'}<br>
          <small>${escapeHtml(prod.categoria || '')}</small>
        </div>
        <div class="crud-actions">
          <button data-id="${escapeHtml(prod.id)}" data-action="edit">✏️</button>
          <button data-id="${escapeHtml(prod.id)}" data-action="delete" class="danger">🗑️</button>
        </div>
      `;
      listEl.appendChild(li);
    });

    listEl.querySelectorAll('button[data-action="edit"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (titleEl) titleEl.textContent = "Editar casa";

        form.scrollIntoView({ behavior: 'smooth' });
      });
    });

    listEl.querySelectorAll('button[data-action="delete"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        let productos = getProducts().filter(p => String(p.id) !== String(id));
        saveProducts(productos);
        renderManagementList();
        renderIndexList();
      });
    });
  }

  const params = new URLSearchParams(location.search);
  const urlId = params.get('id');
  if (urlId) {
    const prod = getProducts().find(p => String(p.id) === String(urlId));
    if (prod) {
      inputId.value = prod.id || "";
      nameInput.value = prod.nombre || "";
      priceInput.value = prod.precio || "";
      catInput.value = prod.categoria || "";
      descInput.value = prod.descripcion || "";
      if (titleEl) titleEl.textContent = "Editar casa";
    }
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = "";

    const nombre = nameInput.value.trim();
    const precio = priceInput.value.trim();
    const categoria = catInput.value.trim();
    const descripcion = descInput.value.trim();
    const file = imgInput.files && imgInput.files[0] ? imgInput.files[0] : null;

    if (!nombre || !precio) {
      feedback.textContent = "Rellena al menos nombre y precio.";
      return;
    }

    let productos = getProducts();
    const editId = inputId.value ? String(inputId.value) : null;

    let imagenData = null;
    if (file) {
      try { imagenData = await fileToDataUrl(file); }
      catch (err) { console.error("Error al leer imagen:", err); imagenData = null; }
    }

    if (editId) {

      const idx = productos.findIndex(p => String(p.id) === String(editId));
      if (idx === -1) {
        feedback.textContent = "No se encontró la vivienda para actualizar.";
        return;
      }
      productos[idx] = {
        ...productos[idx],
        nombre,
        precio,
        categoria,
        descripcion,
        imagen: imagenData || productos[idx].imagen || ""
      };
      saveProducts(productos);
      feedback.textContent = "Nueva vivienda actualizado.";

      inputId.value = "";
      if (titleEl) titleEl.textContent = "Añadir casa";
    } else {

      const nuevo = {
        id: generateId(),
        nombre,
        precio,
        categoria,
        descripcion,
        imagen: imagenData || ""
      };
      productos.push(nuevo);
      saveProducts(productos);
      feedback.textContent = "Vivienda publicada.";
      form.reset();
    }

    renderManagementList();
    renderIndexList();

  });


  const btnCancel = document.getElementById("btn-cancel");
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {

      form.reset();
      inputId.value = "";
      if (titleEl) titleEl.textContent = "Añadir casa";
    });
  }

  renderManagementList();
}

document.addEventListener("DOMContentLoaded", () => {

  renderIndexList();

  setupManagement();
});

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    renderIndexList();
    const manageForm = document.getElementById("manage-form");
    if (manageForm) {
      setTimeout(() => {
        const list = document.getElementById("product-list");
        if (list) {
          renderIndexList();
        }
      }, 50);
    }
  }
});

document.addEventListener("scroll", () => {
const box = document.getElementById("contacts");
if (!box) return;

const scrollLimit = 300;
let opacity = Math.min(1, window.scrollY / scrollLimit);
box.style.opacity = opacity;
}
);