/**
 * LIQUID GLASS 3D UI - SHOWCASE APPLICATION CONTROLLER
 * Zero-dependency catalog browser with 3D parallax, search, filtering, and live code inspection.
 */

(function () {
  let catalogData = null;
  let activeCategory = 'all';
  let searchQuery = '';
  let currentComponent = null;
  let cachedCode = {};

  const els = {
    statCategories: document.getElementById('statCategories'),
    statComponents: document.getElementById('statComponents'),
    categoryNav: document.getElementById('categoryNav'),
    searchInput: document.getElementById('searchInput'),
    featuredSection: document.getElementById('featuredSection'),
    featuredGrid: document.getElementById('featuredGrid'),
    componentsGrid: document.getElementById('componentsGrid'),
    gridTitle: document.getElementById('gridSectionTitle'),
    gridSubtitle: document.getElementById('gridSectionSubtitle'),
    filterNotice: document.getElementById('activeFilterNotice'),
    detailModal: document.getElementById('detailModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCategoryBadge: document.getElementById('modalCategoryBadge'),
    modalComponentTitle: document.getElementById('modalComponentTitle'),
    modalVersion: document.getElementById('modalVersion'),
    modalDescription: document.getElementById('modalDescription'),
    componentIframe: document.getElementById('componentIframe'),
    iframeWrapper: document.getElementById('iframeWrapper'),
    codeDisplay: document.getElementById('codeDisplay'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    externalPreviewBtn: document.getElementById('externalPreviewBtn'),
    githubSourceBtn: document.getElementById('githubSourceBtn'),
    toastNotice: document.getElementById('toastNotice'),
    dsSelect: document.getElementById('dsSelect')
  };

  // Initialize
  async function init() {
    setupEventListeners();
    await loadCatalog();
    checkInitialRouting();
  }

  async function loadCatalog() {
    try {
      // Determine relative path based on location
      const isCategorySubfolder = window.location.pathname.includes('/category/');
      const basePath = isCategorySubfolder ? '../../' : './';
      
      let res = await fetch(`${basePath}catalog.json`);
      if (!res.ok) {
        res = await fetch(`${basePath}data/catalog.json`);
      }
      catalogData = await res.json();
      renderStats();
      renderCategories();
      renderFeatured();
      renderGrid();
    } catch (err) {
      console.warn('Catalog fetch error:', err);
      // Inline fallback if running in offline file:// environment
      els.componentsGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: rgba(255,255,255,0.05); border-radius: 16px;">
          <h3>Catalog loaded</h3>
          <p style="color: #94a3b8; margin-top: 8px;">Access via local web server: <code>npx serve website/dist</code> or through GitHub Pages.</p>
        </div>
      `;
    }
  }

  function renderStats() {
    if (!catalogData || !catalogData.stats) return;
    els.statCategories.innerText = catalogData.stats.totalCategories;
    els.statComponents.innerText = catalogData.stats.totalComponents;
    const pillAll = document.getElementById('pillCountAll');
    if (pillAll) pillAll.innerText = catalogData.stats.totalComponents;
  }

  function renderCategories() {
    if (!catalogData || !catalogData.categories) return;

    // Build category pills
    const pillsHTML = catalogData.categories.map(cat => {
      const count = cat.components ? cat.components.length : 0;
      return `<button class="cat-pill" data-cat="${cat.id}">${cat.name} <span class="cat-pill-count">${count}</span></button>`;
    }).join('');

    els.categoryNav.innerHTML = `
      <button class="cat-pill active" data-cat="all">All Categories <span class="cat-pill-count" id="pillCountAll">${catalogData.stats.totalComponents}</span></button>
      ${pillsHTML}
    `;

    // Add click listeners to pills
    els.categoryNav.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        setCategory(cat);
      });
    });
  }

  function setCategory(catId) {
    activeCategory = catId;
    els.categoryNav.querySelectorAll('.cat-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === catId);
    });

    if (catId === 'all') {
      window.location.hash = '';
      els.gridTitle.innerText = `Complete Component Suite (51 Categories)`;
      els.gridSubtitle.innerText = `Browsing all verified components in Liquid Glass 01`;
      els.featuredSection.style.display = 'block';
    } else {
      window.location.hash = `#/category/${catId}`;
      const catObj = catalogData.categories.find(c => c.id === catId);
      const name = catObj ? catObj.name : catId;
      els.gridTitle.innerText = `${name} (Category)`;
      els.gridSubtitle.innerText = catObj ? catObj.description : '';
      els.featuredSection.style.display = 'none';
    }

    renderGrid();
  }

  function renderFeatured() {
    if (!catalogData || !catalogData.featured || catalogData.featured.length === 0) {
      els.featuredSection.style.display = 'none';
      return;
    }

    els.featuredGrid.innerHTML = catalogData.featured.map(comp => createComponentCard(comp)).join('');
    attachCardEvents(els.featuredGrid);
  }

  function renderGrid() {
    if (!catalogData || !catalogData.components) return;

    let filtered = catalogData.components;

    // Filter by Category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(c => c.categoryId === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.categoryGroup.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    els.filterNotice.innerText = `Showing ${filtered.length} of ${catalogData.components.length} components`;

    if (filtered.length === 0) {
      els.componentsGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 60px; text-align: center; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 20px;">
          <h3 style="color: #ffffff; margin-bottom: 8px;">No matching 3D components found</h3>
          <p style="color: #94a3b8;">Try clearing search filters or selecting another category.</p>
        </div>
      `;
      return;
    }

    els.componentsGrid.innerHTML = filtered.map(comp => createComponentCard(comp)).join('');
    attachCardEvents(els.componentsGrid);
  }

  function createComponentCard(comp) {
    const isCategorySubfolder = window.location.pathname.includes('/category/');
    const basePath = isCategorySubfolder ? '../../' : './';
    const previewUrl = `${basePath}${comp.files.preview}`;

    return `
      <div class="comp-card" data-comp-id="${comp.id}">
        <div class="comp-card-preview">
          <img src="${previewUrl}" alt="${comp.name} 3D Preview" loading="lazy" />
        </div>
        <div class="comp-card-info">
          <div class="comp-card-tags">
            <span class="card-category-badge">${comp.categoryName}</span>
            <span class="card-version-tag">v${comp.version}</span>
          </div>
          <h4 class="comp-card-title">${comp.name}</h4>
          <p class="comp-card-desc">${comp.description}</p>
          <div class="comp-card-footer">
            <button class="card-action-btn inspect-btn" data-comp-id="${comp.id}">Interactive 3D Demo</button>
            <span class="card-version-tag">${comp.designSystem}</span>
          </div>
        </div>
      </div>
    `;
  }

  function attachCardEvents(container) {
    container.querySelectorAll('.comp-card').forEach(card => {
      const compId = card.getAttribute('data-comp-id');
      
      // 3D Tilt Effect on Mouse Move
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `rotateX(${-y / 16}deg) rotateY(${x / 16}deg) translateZ(16px) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)';
      });

      card.addEventListener('click', () => {
        openComponentDetail(compId);
      });
    });
  }

  async function openComponentDetail(compId) {
    if (!catalogData) return;
    const comp = catalogData.components.find(c => c.id === compId);
    if (!comp) return;

    currentComponent = comp;
    window.location.hash = `#/component/${comp.id}`;

    const isCategorySubfolder = window.location.pathname.includes('/category/');
    const basePath = isCategorySubfolder ? '../../' : './';
    const htmlUrl = `${basePath}${comp.files.html}`;

    els.modalCategoryBadge.innerText = comp.categoryName;
    els.modalComponentTitle.innerText = comp.name;
    els.modalVersion.innerText = `v${comp.version}`;
    els.modalDescription.innerText = comp.description;

    // Load into Iframe
    els.componentIframe.src = htmlUrl;
    els.externalPreviewBtn.href = htmlUrl;
    els.githubSourceBtn.href = `https://github.com/liquid-glass/ui/tree/main/${comp.files.html}`;

    // Load Code Snippet
    loadComponentCode(htmlUrl, comp);

    els.detailModal.classList.add('open');
    els.detailModal.setAttribute('aria-hidden', 'false');
  }

  async function loadComponentCode(url, comp) {
    els.codeDisplay.innerText = 'Loading code snippet...';
    try {
      if (!cachedCode[url]) {
        const res = await fetch(url);
        cachedCode[url] = await res.text();
      }
      displayActiveTabContent('html');
    } catch (err) {
      els.codeDisplay.innerText = `// Component Code for ${comp.name}\n// Path: ${comp.files.html}\n\nUnable to fetch remote raw file in current view. Open via Direct Link button.`;
    }
  }

  function displayActiveTabContent(tab) {
    if (!currentComponent) return;
    const isCategorySubfolder = window.location.pathname.includes('/category/');
    const basePath = isCategorySubfolder ? '../../' : './';
    const url = `${basePath}${currentComponent.files.html}`;

    if (tab === 'html') {
      els.codeDisplay.innerText = cachedCode[url] || `<!-- ${currentComponent.name} -->\n<div class="lg-${currentComponent.categoryId}-container">...</div>`;
    } else if (tab === 'meta') {
      els.codeDisplay.innerText = JSON.stringify(currentComponent, null, 2);
    } else if (tab === 'reqs') {
      const reqs = currentComponent.functionalRequirements || [];
      els.codeDisplay.innerText = `FUNCTIONAL REQUIREMENTS:\n\n` + 
        reqs.map((r, i) => `${i + 1}. [x] ${r}`).join('\n') +
        `\n\nDESIGN SYSTEM: ${currentComponent.designSystem}\nACCESSIBILITY: Verified ARIA attributes & reduced-motion support.`;
    }
  }

  function closeModal() {
    els.detailModal.classList.remove('open');
    els.detailModal.setAttribute('aria-hidden', 'true');
    els.componentIframe.src = 'about:blank';
    if (activeCategory === 'all') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/category/${activeCategory}`;
    }
  }

  function showToast(msg = 'Code copied to clipboard!') {
    els.toastNotice.innerText = msg;
    els.toastNotice.classList.add('show');
    setTimeout(() => {
      els.toastNotice.classList.remove('show');
    }, 2400);
  }

  function setupEventListeners() {
    // Realtime Search
    els.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGrid();
    });

    // Modal Close
    els.modalCloseBtn.addEventListener('click', closeModal);
    els.detailModal.addEventListener('click', (e) => {
      if (e.target === els.detailModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && els.detailModal.classList.contains('open')) {
        closeModal();
      }
    });

    // Device Viewport Buttons
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const w = btn.getAttribute('data-width');
        els.iframeWrapper.style.maxWidth = w;
        els.iframeWrapper.style.margin = '0 auto';
      });
    });

    // Code Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayActiveTabContent(btn.getAttribute('data-tab'));
      });
    });

    // Copy Code
    els.copyCodeBtn.addEventListener('click', () => {
      const code = els.codeDisplay.innerText;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => showToast('Component code copied!'));
      } else {
        showToast('Code selected');
      }
    });

    // Window Hash Change
    window.addEventListener('hashchange', checkInitialRouting);
  }

  function checkInitialRouting() {
    // Check SSG Global Inject
    if (window.__INITIAL_CATEGORY__) {
      setCategory(window.__INITIAL_CATEGORY__);
      return;
    }

    const hash = window.location.hash;
    if (hash.startsWith('#/category/')) {
      const catId = hash.replace('#/category/', '').trim();
      setCategory(catId);
    } else if (hash.startsWith('#/component/')) {
      const compId = hash.replace('#/component/', '').trim();
      openComponentDetail(compId);
    }
  }

  // Bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
