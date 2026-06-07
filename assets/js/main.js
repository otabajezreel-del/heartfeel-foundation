const ADMIN_PASSWORD = "HeartFeelAdmin2026";
const STORAGE_KEY = "heartfeel_site_data";
const AUTH_KEY = "heartfeel_admin_auth";
const DB_NAME = "HeartFeelDB";
const DB_VERSION = 1;
const DB_STORE = "siteData";

// IndexedDB cache (in-memory backup)
let dbCache = {};
let dbInitPromise = null;

// Initialize IndexedDB
function initIndexedDB() {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not available, falling back to in-memory storage');
      resolve(false);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.close();
      resolve(true);
    };
  }).catch(err => {
    console.error('IndexedDB init failed:', err);
    return false;
  });

  return dbInitPromise;
}

// Get from IndexedDB
async function dbGet(key) {
  try {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const get = store.get(key);
        get.onsuccess = () => {
          db.close();
          resolve(get.result);
        };
        get.onerror = () => reject(get.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB get failed:', err);
    return dbCache[key];
  }
}

// Set to IndexedDB
async function dbSet(key, value) {
  dbCache[key] = value;
  try {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const put = store.put(value, key);
        put.onsuccess = () => {
          db.close();
          resolve(true);
        };
        put.onerror = () => reject(put.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB set failed:', err);
    return true;
  }
}

// Load all data from IndexedDB on startup
async function loadDBCache() {
  try {
    const data = await dbGet(STORAGE_KEY);
    if (data) {
      dbCache[STORAGE_KEY] = data;
    }
    const auth = await dbGet(AUTH_KEY);
    if (auth !== undefined) {
      dbCache[AUTH_KEY] = auth;
    }
  } catch (err) {
    console.warn('Failed to load DB cache:', err);
  }
}

const defaultSiteData = {
  home: {
    heroSubtitle: "Community impact",
    heroTitle: "Inspiring trust, building hope, and funding lasting change.",
    heroCopy: "HeartFeel Foundation connects donors and volunteers to programs that support education, health, food security, and local leadership through transparent fundraising and measurable results.",
    buttonPrimary: { text: "Donate securely", href: "donate.html" },
    buttonSecondary: { text: "Become a volunteer", href: "volunteer.html" },
    stats: [
      { label: "Communities served", value: "42+" },
      { label: "Volunteers engaged", value: "1,200+" },
      { label: "Funds distributed", value: "$4.5M" },
      { label: "Projects completed", value: "85+" },
    ],
    programs: [
      { title: "Youth Education Support", description: "Scholarships, after-school learning labs, and digital skills training for underserved youth." },
      { title: "Food Security Initiatives", description: "Community gardens, emergency food distributions, and nutrition workshops for families in need." },
      { title: "Health & Wellness Outreach", description: "Mobile clinics, mental health counseling, and vaccination drives to strengthen local care." },
      { title: "Women's Empowerment", description: "Entrepreneurship coaching, savings groups, and leadership development for women." },
    ],
    successStories: [
      { quote: "From school dropouts to scholarship recipients, our learning lab has restarted 120 dreams.", author: "Amina, Program Coordinator" },
      { quote: "A community garden now supports 150 families every month with fresh produce and nutrition education.", author: "Samuel, Local Partner" },
    ],
    testimonials: [
      { quote: "HeartFeel made me feel seen and supported during a time when resources were scarce.", name: "Grace N.", role: "Donor & Community Advocate" },
      { quote: "The transparency reports made it easy to trust where donations were going.", name: "Michael T.", role: "Corporate Sponsor" },
    ],
    bottomCards: [
      { title: "Donor trust and transparency", description: "We publish financial transparency reports and program budgets so supporters can see exactly how donations are spent." },
      { title: "Volunteer leadership", description: "Volunteers play a central role in our outreach, training, and care programs. Every opportunity is designed with safety and community partnership in mind." },
    ],
  },
  about: {
    heroSubtitle: "About HeartFeel",
    heroTitle: "Building trust through transparency and meaningful impact.",
    heroCopy: "Our mission is to deliver compassionate support and measurable outcomes through inclusive programs, fundraising integrity, and community partnership.",
    cards: [
      { subtitle: "Mission & Values", title: "We invest in projects that lift lives and strengthen local capacity.", description: "Our core values are accountability, empathy, equity, and sustainability. Every program is guided by community priorities and long-term outcomes." },
      { subtitle: "Financial Transparency", title: "Open reporting for every donor and partner.", description: "We publish quarterly financial reports, program budgets, and impact statements so supporters always know how contributions are used." },
      { subtitle: "Partnership Model", title: "Collaborating with local leaders and global donors.", description: "Our work is grounded in local partnership, public agency support, and donor alignment to ensure every intervention is sustainable and relevant." },
    ],
    whatWeDo: {
      title: "Delivering relief, opportunity, and accountable stewardship.",
      items: [
        "Provide urgent relief through food, healthcare, and shelter programs.",
        "Develop long-term education, livelihood, and empowerment initiatives.",
        "Support volunteers with training, safety protocols, and mentorship.",
        "Maintain open governance and donor reporting for accountability.",
      ],
      buttonText: "Connect with our team",
      buttonHref: "contact.html",
    },
  },
  programs: {
    heroSubtitle: "Our programs",
    heroTitle: "Projects designed for lasting impact.",
    heroCopy: "Each program is built around community-led priorities, measurable outcomes, and transparent funding so donors can see meaningful progress.",
    programs: [
      { title: "Youth Education Support", description: "Scholarships, after-school learning labs, mentorship, and digital skills training for young learners." },
      { title: "Food Security Initiatives", description: "Community gardens, emergency food distributions, nutrition workshops, and sustainable farming guidance." },
      { title: "Health & Wellness Outreach", description: "Mobile clinics, vaccination drives, mental health counseling, and wellness education across underserved regions." },
      { title: "Women's Empowerment", description: "Business coaching, savings groups, and leadership programs that help women build confidence and independence." },
    ],
    showcases: [
      "Education centers offering evening tutoring and career mentoring.",
      "Local gardens supplying fresh produce to schools and families.",
      "Wellness teams providing free health screenings and counseling.",
      "Entrepreneurship programs helping women launch small businesses.",
    ],
  },
  gallery: {
    heroSubtitle: "Gallery",
    heroTitle: "Photos and documentaries showing our impact.",
    heroCopy: "Browse images and short films that capture community progress, volunteer action, and donor-supported success stories.",
    images: [
      { title: "Community garden harvest", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80" },
      { title: "Mobile health clinic", url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80" },
      { title: "Volunteer training session", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" },
      { title: "Celebrating graduation", url: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=900&q=80" },
    ],
    videos: [
      { title: "Community recovery after crisis", src: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Youth mental health and resilience", src: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
    ],
  },
  blog: {
    heroSubtitle: "News & Updates",
    heroTitle: "Insights, transparency, and the latest program news.",
    heroCopy: "Stay informed with stories from our field teams, donor reports, and project highlights that demonstrate accountability and progress.",
    posts: [
      { subtitle: "Featured story", title: "Building Resilient Communities After Crisis", summary: "How our teams restored clean water access and stable food supply after flood season, bringing immediate relief and long-term resilience.", href: "#" },
      { subtitle: "Program update", title: "Investing in Youth Mental Health", summary: "The new counseling program is improving academic outcomes and emotional wellbeing for young people across partner communities.", href: "#" },
      { subtitle: "Transparency report", title: "Q1 2026 Financial Transparency Report", summary: "Our latest financial and program performance report, published for donors, partners, and community stakeholders.", href: "#" },
    ],
  },
  volunteer: {
    heroSubtitle: "Volunteer",
    heroTitle: "Join our volunteer community and make a meaningful difference.",
    heroCopy: "Register to support programs, events, outreach, and administrative coordination across our projects.",
  },
  contact: {
    heroSubtitle: "Contact",
    heroTitle: "Reach out for partnership, support, or media inquiries.",
    heroCopy: "We welcome donors, volunteers, partners, and journalists to connect with our team for thoughtful responses and collaboration.",
    email: "info@heartfeelfoundation.org",
    phone: "+1 (555) 123-4567",
    address: "258 Community Ave, Hope City, CA",
    hours: ["Monday — Friday: 9am to 6pm", "Saturday: 10am to 2pm"],
  },
  donate: {
    heroSubtitle: "Secure donation",
    heroTitle: "Support HeartFeel Foundation with trusted payment options.",
    heroCopy: "Choose Mobile Money, Visa/Mastercard, or PayPal and contribute to projects that deliver transparent, high-impact results.",
    assistance: {
      title: "Donation assistance",
      body: "We accept multiple payment options to make giving easy and accessible. The form below is ready for integration with secure payment providers.",
      methods: [
        "Mobile Money for local and regional donors",
        "Visa / Mastercard for global contributors",
        "PayPal for trusted one-click support",
      ],
    },
    why: {
      title: "Why donate?",
      body: "Your gift supports community programs, financial transparency, and volunteer-led solutions with measurable outcomes.",
    },
  },
};

function getStoredData() {
  const cached = dbCache[STORAGE_KEY];
  if (!cached) {
    return defaultSiteData;
  }

  try {
    return { ...defaultSiteData, ...cached };
  } catch (error) {
    console.warn("Unable to parse stored site data, using defaults.", error);
    return defaultSiteData;
  }
}

async function saveSiteData(data) {
  try {
    await dbSet(STORAGE_KEY, data);
    return true;
  } catch (error) {
    console.error('Unable to save site data to IndexedDB', error);
    return false;
  }
}

function isAdminAuthenticated() {
  return dbCache[AUTH_KEY] === "true";
}

async function logoutAdmin() {
  dbCache[AUTH_KEY] = null;
  await dbSet(AUTH_KEY, null);
  window.location.reload();
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = value;
}

function setHTML(id, html) {
  const element = document.getElementById(id);
  if (!element) return;
  element.innerHTML = html;
}

function setLink(id, text, href) {
  const element = document.getElementById(id);
  if (!element || !("href" in element)) return;
  element.textContent = text;
  element.href = href;
}

function renderCollection(containerId, items, mapper) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(mapper).join("");
}

function renderHome(data) {
  setText("home-hero-subtitle", data.heroSubtitle);
  setText("home-hero-title", data.heroTitle);
  setText("home-hero-copy", data.heroCopy);
  setLink("home-button-primary", data.buttonPrimary.text, data.buttonPrimary.href);
  setLink("home-button-secondary", data.buttonSecondary.text, data.buttonSecondary.href);
  renderCollection("home-stats", data.stats, item => `
      <div class="stat-card">
        <div class="stat-value">${item.value}</div>
        <div class="stat-label">${item.label}</div>
      </div>
    `);
  renderCollection("home-programs", data.programs, item => `
      <article class="feature-card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `);
  renderCollection("home-success-stories", data.successStories, item => `
      <article class="testimonial-card">
        <p>“${item.quote}”</p>
        <cite>${item.author}</cite>
      </article>
    `);
  renderCollection("home-testimonials", data.testimonials, item => `
      <article class="testimonial-card">
        <p>“${item.quote}”</p>
        <cite>${item.name}, ${item.role}</cite>
      </article>
    `);
  renderCollection("home-bottom-cards", data.bottomCards, item => `
      <article class="section-card">
        <h2 class="section-heading">${item.title}</h2>
        <p>${item.description}</p>
      </article>
    `);
}

function renderAbout(data) {
  setText("about-hero-subtitle", data.heroSubtitle);
  setText("about-hero-title", data.heroTitle);
  setText("about-hero-copy", data.heroCopy);
  renderCollection("about-cards", data.cards, item => `
      <article class="section-card">
        <span class="section-subtitle">${item.subtitle}</span>
        <h2 class="section-heading">${item.title}</h2>
        <p>${item.description}</p>
      </article>
    `);
}

function renderPrograms(data) {
  setText("programs-hero-subtitle", data.heroSubtitle);
  setText("programs-hero-title", data.heroTitle);
  setText("programs-hero-copy", data.heroCopy);
  renderCollection("programs-grid", data.programs, item => `
      <article class="feature-card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `);
  const showcase = document.getElementById("programs-showcase");
  if (showcase) {
    showcase.innerHTML = `
      <span class="section-subtitle">Project showcases</span>
      <h2 class="section-heading">Examples of community-driven success.</h2>
      <ul>${data.showcases.map(item => `<li>${item}</li>`).join("")}</ul>
    `;
  }
}

function renderGallery(data) {
  setText("gallery-hero-subtitle", data.heroSubtitle);
  setText("gallery-hero-title", data.heroTitle);
  setText("gallery-hero-copy", data.heroCopy);
  renderCollection("gallery-grid", data.images, item => {
    const isHeic = /(^data:image\/heic)|\.heic($|\?)/i.test(item.url);
    if (isHeic) {
      return `
      <article class="feature-card">
        <div class="hero-image" style="display:flex; align-items:center; justify-content:center; padding:1rem; background:#f8fafc; color:#0f172a; text-align:center;">
          <div>
            <p><strong>HEIC image uploaded.</strong></p>
            <p>Please convert to JPG/PNG for best browser support.</p>
          </div>
        </div>
        <h3>${item.title}</h3>
      </article>
    `;
    }

    return `
      <article class="feature-card">
        <img src="${item.url}" alt="${item.title}" />
        <h3>${item.title}</h3>
      </article>
    `;
  });
  renderCollection("gallery-videos", data.videos, item => {
    // If the src looks like a data URL (local upload) or a direct video URL, render an HTML5 video player.
    if (item.src && (item.src.startsWith('data:video') || item.local || /\.(mp4|webm|ogg)(\?|$)/i.test(item.src))) {
      return `
      <article class="feature-card">
        <h3>${item.title}</h3>
        <div class="hero-image">
          <video controls class="w-full h-full"><source src="${item.src}" type="video/mp4">Your browser does not support the video tag.</video>
        </div>
      </article>
    `;
    }

    // Otherwise assume it's an embed (YouTube/Vimeo)
    return `
      <article class="feature-card">
        <h3>${item.title}</h3>
        <div class="hero-image">
          <iframe class="w-full h-full" src="${item.src}" title="${item.title}" allowfullscreen></iframe>
        </div>
      </article>
    `;
  });
}

function renderBlog(data) {
  setText("blog-hero-subtitle", data.heroSubtitle);
  setText("blog-hero-title", data.heroTitle);
  setText("blog-hero-copy", data.heroCopy);
  renderCollection("blog-grid", data.posts, item => `
      <article class="news-card">
        <span class="section-subtitle">${item.subtitle}</span>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <a href="${item.href}">Read more →</a>
      </article>
    `);
}

function renderVolunteer(data) {
  setText("volunteer-hero-subtitle", data.heroSubtitle);
  setText("volunteer-hero-title", data.heroTitle);
  setText("volunteer-hero-copy", data.heroCopy);
}

function renderContact(data) {
  setText("contact-hero-subtitle", data.heroSubtitle);
  setText("contact-hero-title", data.heroTitle);
  setText("contact-hero-copy", data.heroCopy);
  setText("contact-email", data.email);
  setText("contact-phone", data.phone);
  setText("contact-address", data.address);
  setText("contact-hours-day1", data.hours[0] || "");
  setText("contact-hours-day2", data.hours[1] || "");
}

function renderDonate(data) {
  setText("donate-hero-subtitle", data.heroSubtitle);
  setText("donate-hero-title", data.heroTitle);
  setText("donate-hero-copy", data.heroCopy);
  setText("donate-assistance-title", data.assistance.title);
  const assistance = document.getElementById("donate-assistance");
  if (assistance) {
    const bodyEl = assistance.querySelector("p");
    if (bodyEl) bodyEl.textContent = data.assistance.body;
    const list = assistance.querySelector("ul");
    if (list) list.innerHTML = data.assistance.methods.map(item => `<li>${item}</li>`).join("");
  }
  setText("donate-why-title", data.why.title);
  setText("donate-why-copy", data.why.body);
}

function renderPage() {
  const page = document.body.dataset.page;
  const siteData = getStoredData();
  if (!page) return;
  const pageData = siteData[page] || defaultSiteData[page] || {};

  switch (page) {
    case "home":
      renderHome(pageData);
      break;
    case "about":
      renderAbout(pageData);
      break;
    case "programs":
      renderPrograms(pageData);
      break;
    case "gallery":
      renderGallery(pageData);
      break;
    case "blog":
      renderBlog(pageData);
      break;
    case "volunteer":
      renderVolunteer(pageData);
      break;
    case "contact":
      renderContact(pageData);
      break;
    case "donate":
      renderDonate(pageData);
      break;
    case "admin":
      initAdminPage();
      break;
    default:
      break;
  }
}

function renderAdminLogin(root) {
  root.innerHTML = `
    <div class="section-card">
      <h2 class="section-heading">Admin login</h2>
      <form id="admin-login-form" class="form-grid">
        <div class="form-field">
          <label for="admin-password">Password</label>
          <input id="admin-password" type="password" placeholder="Enter admin password" required />
        </div>
        <div class="form-field" style="grid-column: 1 / -1;">
          <button type="submit" class="btn">Sign in</button>
        </div>
        <p id="admin-login-feedback" style="color: #c2410c;"></p>
      </form>
    </div>
  `;

  const loginForm = document.getElementById("admin-login-form");
  if (!loginForm) return;
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const passwordInput = document.getElementById("admin-password");
    const feedback = document.getElementById("admin-login-feedback");
    if (!passwordInput || !feedback) return;

    if (passwordInput.value === ADMIN_PASSWORD) {
      dbCache[AUTH_KEY] = "true";
      await dbSet(AUTH_KEY, "true");
      renderAdminDashboard(root);
    } else {
      feedback.textContent = "Invalid password. Only admin can access this section.";
    }
  });
}

function renderAdminDashboard(root) {
  const siteData = getStoredData();
  root.innerHTML = `
    <div class="section-card">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="section-heading">Admin control panel</h2>
          <p>Update the JSON below to manage site content for all public pages. Save your changes, then refresh a public page to view the latest content.</p>
        </div>
        <button id="admin-logout" class="btn-secondary">Logout</button>
      </div>
      <div class="form-field" style="margin-top: 1.5rem;">
        <label for="admin-data-json">Site content JSON</label>
        <textarea id="admin-data-json" rows="18" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 1rem; padding: 1rem; font-family: monospace;">${JSON.stringify(siteData, null, 2)}</textarea>
      </div>
      <div class="button-group" style="margin-top: 1rem;">
        <button id="admin-save" class="btn">Save changes</button>
        <button id="admin-reset" class="btn-secondary" type="button">Reset defaults</button>
      </div>
      <p id="admin-save-feedback" style="color: #0f766e; margin-top: 1rem;"></p>
    </div>
  `;

  // Insert media manager container after the admin JSON textarea
  const mediaManagerWrapper = document.createElement('div');
  mediaManagerWrapper.className = 'section-card';
  mediaManagerWrapper.innerHTML = `
    <h3 class="section-heading">Media manager</h3>
    <div class="media-manager">
      <div>
        <div class="media-section">
          <h4>Upload images</h4>
          <div id="media-dropzone-images" class="media-dropzone">Drop image files here, or <button id="media-browse-images" type="button" class="btn-secondary">Browse images</button>
            <input id="media-file-input-images" type="file" accept="image/*,image/heic" multiple style="display:none;" />
          </div>
        </div>
        <div class="media-section" style="margin-top:1rem;">
          <h4>Upload short films</h4>
          <div id="media-dropzone-videos" class="media-dropzone">Drop video files here, or <button id="media-browse-videos" type="button" class="btn-secondary">Browse videos</button>
            <input id="media-file-input-videos" type="file" accept="video/*" multiple style="display:none;" />
          </div>
        </div>
        <p id="media-feedback" style="margin-top:0.75rem; color:#0f766e;">Upload images and films separately. Refresh the gallery page to see them.</p>
        <div style="margin-top:1rem;">
          <div id="media-list" class="media-list"></div>
        </div>
      </div>
      <div>
        <p>Click a thumbnail to remove it from the gallery. Uploaded files are stored in-site (data URLs) and saved to the JSON below automatically. HEIC/HEIF files are converted to PNG on upload for browser compatibility.</p>
      </div>
    </div>
  `;
  root.appendChild(mediaManagerWrapper);

  // Wire media manager behavior
  initMediaManager();

  const saveButton = document.getElementById("admin-save");
  const resetButton = document.getElementById("admin-reset");
  const logoutButton = document.getElementById("admin-logout");

  if (saveButton) {
    saveButton.addEventListener("click", async function () {
      const textarea = document.getElementById("admin-data-json");
      const feedback = document.getElementById("admin-save-feedback");
      if (!textarea || !feedback) return;

      try {
        const updatedData = JSON.parse(textarea.value);
        await saveSiteData(updatedData);
        feedback.style.color = "#0f766e";
        feedback.textContent = "Content saved successfully. Refresh public pages to see updates.";
      } catch (error) {
        feedback.style.color = "#c2410c";
        feedback.textContent = "Unable to parse JSON. Please correct the format and try again.";
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", async function () {
      await saveSiteData(defaultSiteData);
      const textarea = document.getElementById("admin-data-json");
      const feedback = document.getElementById("admin-save-feedback");
      if (textarea) textarea.value = JSON.stringify(defaultSiteData, null, 2);
      if (feedback) {
        feedback.style.color = "#0f766e";
        feedback.textContent = "Site content has been reset to defaults.";
      }
    });
  }


  if (logoutButton) {
    logoutButton.addEventListener("click", logoutAdmin);
  }
}

function initAdminPage() {
  const root = document.getElementById("admin-app");
  if (!root) return;
  if (isAdminAuthenticated()) {
    renderAdminDashboard(root);
  } else {
    renderAdminLogin(root);
  }
}

// -----------------
// Media manager
// -----------------
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function convertHeicFile(file) {
  if (!window.heic2any) {
    throw new Error('HEIC conversion library is not loaded');
  }
  const convertedBlob = await window.heic2any({ blob: file, toType: 'image/png', quality: 0.9 });
  return fileToDataURL(convertedBlob);
}

function getFileType(file) {
  if (file.type) return file.type;
  const extension = file.name.split('.').pop().toLowerCase();
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic', 'heif', 'bmp', 'tiff'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'quicktime', 'm4v', '3gp'];
  if (imageExtensions.includes(extension)) {
    if (extension === 'jpg') return 'image/jpeg';
    if (extension === 'heic' || extension === 'heif') return 'image/heic';
    if (extension === 'bmp') return 'image/bmp';
    if (extension === 'tiff') return 'image/tiff';
    return `image/${extension}`;
  }
  if (videoExtensions.includes(extension)) {
    if (extension === 'quicktime') return 'video/quicktime';
    if (extension === 'avi') return 'video/x-msvideo';
    if (extension === 'mkv') return 'video/x-matroska';
    if (extension === 'flv') return 'video/x-flv';
    if (extension === 'wmv') return 'video/x-ms-wmv';
    if (extension === 'm4v') return 'video/x-m4v';
    if (extension === '3gp') return 'video/3gpp';
    return `video/${extension}`;
  }
  return '';
}

function isImageFile(file) {
  const type = getFileType(file);
  return /image\//.test(type);
}

function isVideoFile(file) {
  const type = getFileType(file);
  return /video\//.test(type);
}

function renderMediaListUI() {
  const siteData = getStoredData();
  const images = (siteData.gallery && siteData.gallery.images) || [];
  const videos = (siteData.gallery && siteData.gallery.videos) || [];
  const list = document.getElementById('media-list');
  if (!list) return;
  list.innerHTML = '';

  images.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'media-item';
    el.innerHTML = `<img src="${item.url}" alt="${item.title || 'image'}" />
      <div style="padding:0.5rem; font-size:0.875rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.title}">${item.title}</div>
      <div class="media-actions"><button data-type="image" data-index="${idx}">Remove</button></div>`;
    list.appendChild(el);
  });

  videos.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'media-item';
    // show poster if available for data URL videos; otherwise show a generic thumbnail
    if (item.src && item.src.startsWith('data:video')) {
      el.innerHTML = `<video muted playsinline preload="metadata"><source src="${item.src}" type="video/mp4"></video>
        <div style="padding:0.5rem; font-size:0.875rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.title}">${item.title}</div>
        <div class="media-actions"><button data-type="video" data-index="${idx}">Remove</button></div>`;
    } else {
      el.innerHTML = `<div style="padding:1rem; background:#f1f5f9; display:flex; align-items:center; justify-content:center; min-height:150px;">Video</div>
        <div style="padding:0.5rem; font-size:0.875rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.title}">${item.title}</div>
        <div class="media-actions"><button data-type="video" data-index="${idx}">Remove</button></div>`;
    }
    list.appendChild(el);
  });

  // attach remove handlers
  list.querySelectorAll('button[data-type]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-type');
      const index = Number(btn.getAttribute('data-index'));
      const siteData = getStoredData();
      if (type === 'image') {
        siteData.gallery.images.splice(index, 1);
      } else {
        siteData.gallery.videos.splice(index, 1);
      }
      await saveSiteData(siteData);
      // update textarea if present
      const ta = document.getElementById('admin-data-json');
      if (ta) ta.value = JSON.stringify(siteData, null, 2);
      renderMediaListUI();
    });
  });
}

function initMediaManager() {
  const imageDrop = document.getElementById('media-dropzone-images');
  const videoDrop = document.getElementById('media-dropzone-videos');
  const imageInput = document.getElementById('media-file-input-images');
  const videoInput = document.getElementById('media-file-input-videos');
  const imageBrowse = document.getElementById('media-browse-images');
  const videoBrowse = document.getElementById('media-browse-videos');

  function addDropHandlers(dropZone, handleUpload) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#38bdf8'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#cbd5e1'; });
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#cbd5e1';
      const files = Array.from(e.dataTransfer.files || []);
      try {
        await handleUpload(files);
      } catch (err) {
        console.error('Upload error', err);
        alert('Unable to upload files. See console for details.');
      }
    });
  }

  if (imageDrop && imageInput) {
    addDropHandlers(imageDrop, async (files) => {
      const imageFiles = files.filter(file => isImageFile(file) || /\.(heic|heif)$/i.test(file.name));
      const invalid = files.filter(file => !(isImageFile(file) || /\.(heic|heif)$/i.test(file.name)));
      if (invalid.length) {
        alert('Only image files are allowed in the image upload area.');
      }
      await handleFilesUpload(imageFiles, 'image');
    });
    imageDrop.addEventListener('click', () => imageInput.click());
  }

  if (videoDrop && videoInput) {
    addDropHandlers(videoDrop, async (files) => {
      const videoFiles = files.filter(file => isVideoFile(file));
      const invalid = files.filter(file => !isVideoFile(file));
      if (invalid.length) {
        alert('Only video files are allowed in the short film upload area.');
      }
      await handleFilesUpload(videoFiles, 'video');
    });
    videoDrop.addEventListener('click', () => videoInput.click());
  }

  if (imageBrowse && imageInput) {
    imageBrowse.addEventListener('click', (e) => { e.stopPropagation(); imageInput.click(); });
  }
  if (videoBrowse && videoInput) {
    videoBrowse.addEventListener('click', (e) => { e.stopPropagation(); videoInput.click(); });
  }

  if (imageInput) {
    imageInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      try {
        await handleFilesUpload(files, 'image');
      } catch (err) {
        console.error('Upload error', err);
        alert('Unable to upload files. See console for details.');
      }
      imageInput.value = '';
    });
  }

  if (videoInput) {
    videoInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      try {
        await handleFilesUpload(files, 'video');
      } catch (err) {
        console.error('Upload error', err);
        alert('Unable to upload files. See console for details.');
      }
      videoInput.value = '';
    });
  }

  // initial render
  renderMediaListUI();
}

async function handleFilesUpload(files, mode = 'auto') {
  if (!files || !files.length) return;
  const siteData = getStoredData();
  siteData.gallery = siteData.gallery || { images: [], videos: [] };

  const skippedFiles = [];
  const savedFiles = [];
  console.log('🚀 Upload started - mode:', mode, 'files:', files.length);

  for (const file of files) {
    try {
      console.log('📁 Processing file:', file.name, 'type:', file.type, 'size:', file.size);
      if (mode === 'image') {
        if (/\.(heic|heif)$/i.test(file.name)) {
          console.log('🖼️ Converting HEIC...');
          const dataURL = await convertHeicFile(file);
          siteData.gallery.images.push({ title: file.name.replace(/\.(heic|heif)$/i, '.png'), url: dataURL });
          savedFiles.push(file.name);
          console.log('✅ HEIC converted and added');
        } else if (isImageFile(file)) {
          console.log('🖼️ Processing image file...');
          const dataURL = await fileToDataURL(file);
          siteData.gallery.images.push({ title: file.name, url: dataURL });
          savedFiles.push(file.name);
          console.log('✅ Image added');
        } else {
          skippedFiles.push(file.name);
          console.log('⚠️ Skipped - not recognized as image');
        }
      } else if (mode === 'video') {
        if (isVideoFile(file)) {
          console.log('🎬 Processing video file...');
          const dataURL = await fileToDataURL(file);
          siteData.gallery.videos.push({ title: file.name, src: dataURL, local: true });
          savedFiles.push(file.name);
          console.log('✅ Video added');
        } else {
          skippedFiles.push(file.name);
          console.log('⚠️ Skipped - not recognized as video:', getFileType(file));
        }
      } else {
        if (/\.(heic|heif)$/i.test(file.name)) {
          const dataURL = await convertHeicFile(file);
          siteData.gallery.images.push({ title: file.name.replace(/\.(heic|heif)$/i, '.png'), url: dataURL });
          savedFiles.push(file.name);
        } else if (isImageFile(file)) {
          const dataURL = await fileToDataURL(file);
          siteData.gallery.images.push({ title: file.name, url: dataURL });
          savedFiles.push(file.name);
        } else if (isVideoFile(file)) {
          const dataURL = await fileToDataURL(file);
          siteData.gallery.videos.push({ title: file.name, src: dataURL, local: true });
          savedFiles.push(file.name);
        } else {
          skippedFiles.push(file.name);
        }
      }
    } catch (err) {
      skippedFiles.push(file.name);
      console.error('❌ Error reading file', file.name, err);
    }
  }

  console.log('💾 Saving to IndexedDB...');
  const saved = await saveSiteData(siteData);
  console.log('✅ Save result:', saved, 'Total images:', siteData.gallery.images.length, 'Total videos:', siteData.gallery.videos.length);
  
  const ta = document.getElementById('admin-data-json');
  const feedback = document.getElementById('media-feedback');
  if (ta) ta.value = JSON.stringify(siteData, null, 2);
  if (feedback) {
    if (!saved) {
      feedback.textContent = 'Unable to save media: IndexedDB is unavailable. Try smaller files or refresh the page.';
      feedback.style.color = '#c2410c';
    } else {
      const successText = savedFiles.length ? `Uploaded ${savedFiles.length} file(s). Refresh the gallery page to see them.` : '';
      const skippedText = skippedFiles.length ? ` Skipped: ${skippedFiles.join(', ')}.` : '';
      feedback.textContent = `${successText}${skippedText}`.trim();
      feedback.style.color = savedFiles.length ? '#0f766e' : '#c2410c';
    }
  }
  renderMediaListUI();
}


function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-links");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }
}

function initDonationForm() {
  const donationForm = document.querySelector("#donation-form");
  if (donationForm) {
    donationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const message = document.querySelector("#donation-status");
      if (message) {
        message.textContent = "Thank you! Your donation selection has been recorded. A secure checkout page would follow in a full payment integration.";
      }
    });
  }
}

function initStorageSync() {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      renderPage();
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  await initIndexedDB();
  await loadDBCache();
  initNavigation();
  initDonationForm();
  initStorageSync();
  renderPage();
});
