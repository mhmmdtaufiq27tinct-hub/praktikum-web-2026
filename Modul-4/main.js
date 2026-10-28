// File: main.js
// Integrasi Logika Data, Form Handling, Filter Kategori, dan Live Search
const projects = [
    {
        id: 1,
        title: "Sistem Inventaris Keuangan",
        category: "Web App",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Kasir Digital POS",
        category: "Desktop App",
        budget: 5000000,
        completed: true
    },
    {
        id: 3,
        title: "Landing Page Profil Perusahaan",
        category: "Web App",
        budget: 1500000,
        completed: false
    },
    {
        id: 4,
        title: "Aplikasi Presensi GPS Mobile",
        category: "Mobile App",
        budget: 4500000,
        completed: false
    }
];

// State Global untuk Filter Terpadu
let activeCategory = "Semua";
let searchQuery = "";

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
};

const updateStats = (dataList) => {
    const totalProjects = dataList.length;
    const totalBudget = dataList.reduce((acc, curr) => acc + curr.budget, 0);
    const completedCount = dataList.filter(item => item.completed).length;

    const elTotal = document.getElementById("stat-total-projects");
    const elBudget = document.getElementById("stat-total-budget");
    const elCompleted = document.getElementById("stat-completed-projects");

    if (elTotal) elTotal.textContent = totalProjects;
    if (elBudget) elBudget.textContent = formatRupiah(totalBudget);
    if (elCompleted) elCompleted.textContent = completedCount;
};

const renderProjects = (filteredList) => {
    const container = document.getElementById("project-list");
    if (!container) return;

    if (filteredList.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Proyek tidak ditemukan.</p>`;
        return;
    }

    const htmlString = filteredList.map(proj => {
        const badgeClass = proj.completed ? "badge-success" : "badge-pending";
        const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";
        return `
            <div class="project-card">
                <div class="project-info">
                    <span class="project-category">${proj.category}</span>
                    <h4>${proj.title}</h4>
                    <p class="project-budget">${formatRupiah(proj.budget)}</p>
                </div>
                <div>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = htmlString;
};

// Fungsi Utama Filter Terpadu (Kategori + Search Query)
const applyFilters = () => {
    const filtered = projects.filter(p => {
        const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    renderProjects(filtered);
};

document.addEventListener("DOMContentLoaded", () => {
    renderProjects(projects);
    updateStats(projects);

    // --- FITUR 1: Handling Form Submit ---
    const projectForm = document.getElementById("project-form");
    if (projectForm) {
        projectForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const titleInput = document.getElementById("project-title");
            const categoryInput = document.getElementById("project-category");
            const budgetInput = document.getElementById("project-budget");
            const completedInput = document.getElementById("project-completed");

            const title = titleInput.value.trim();
            const category = categoryInput.value;
            const budget = Number(budgetInput.value);
            const completed = completedInput.checked;

            // Validasi Input
            if (!title) {
                alert("Judul proyek tidak boleh kosong!");
                return;
            }

            if (isNaN(budget) || budget <= 0) {
                alert("Estimasi anggaran harus lebih besar dari 0!");
                return;
            }

            // Tambahkan Objek Proyek Baru
            const newProject = {
                id: Date.now(),
                title: title,
                category: category,
                budget: budget,
                completed: completed
            };

            projects.push(newProject);

            // Render ulang daftar & update statistik total
            applyFilters();
            updateStats(projects);

            // Reset Form
            projectForm.reset();
        });
    }

    // --- FITUR 2: Pencarian Real-Time (Live Search) ---
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            applyFilters();
        });
    }

    // --- Filter Buttons Handling ---
    const filterButtons = document.querySelectorAll(".btn-filter");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const currentBtn = e.currentTarget;
            filterButtons.forEach(b => b.classList.remove("active"));
            currentBtn.classList.add("active");

            activeCategory = currentBtn.getAttribute("data-category");
            applyFilters();
        });
    });
});