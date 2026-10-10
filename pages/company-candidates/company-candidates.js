// Search & Filter
    const searchInput = document.getElementById('candidateSearchInput');
    const filterButtons = document.querySelectorAll('.bw-tag-btn[data-filter]');
    const rows = document.querySelectorAll('#candidateTableBody tr');

    let activeFilter = 'all';

    function applyCandidateFilter() {
      const q = (searchInput?.value || '').toLowerCase().trim();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.getAttribute('data-status');
        const matchesFilter = activeFilter === 'all' || status === activeFilter;
        const matchesSearch = !q || text.includes(q);
        row.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
      });
    }

    searchInput?.addEventListener('input', applyCandidateFilter);

    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        activeFilter = this.getAttribute('data-filter') || 'all';
        applyCandidateFilter();
      });
    });

// Explicit handlers keep HTML presentation-only and preserve native event semantics.
(function () {
  document.querySelectorAll('[data-onclick="showPortalToast--1"]').forEach(element => {
    element.onclick = function(event) { showPortalToast('Student profile verified via BAU SIS.'); };
  });
  document.querySelectorAll('[data-onclick="closest-tr-2"]').forEach(element => {
    element.onclick = function(event) { this.closest('tr').querySelector('.bw-badge-amber').className='bw-badge bw-badge-success'; this.closest('tr').querySelector('.bw-badge-success').innerHTML='<i class=\'bi bi-check-circle-fill\'></i> Accepted'; this.remove(); showPortalToast('Company acceptance preview only. Nothing was sent.'); };
  });
})();
