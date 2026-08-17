/* Journal complet des trades cloturés ExoTradingPlus! · filtres + tri, % uniquement. */
(function () {
  var DATA = window.TR_TRADES;
  var tbody = document.getElementById('trj-tbody');
  if (!DATA || !tbody) return;

  var state = { market: 'all', sens: 'all', result: 'all', query: '', sort: 'date' };

  var els = {
    stats: document.getElementById('trj-stats'),
    count: document.getElementById('trj-count'),
    note: document.getElementById('trj-note'),
    search: document.getElementById('trj-search'),
    sort: document.getElementById('trj-sort')
  };

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(d) {
    var p = d.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d;
  }
  function fmtPct(v) {
    var s = (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%';
    return s;
  }
  function marketLabel(m) { return m === 'C' ? 'Crypto' : 'Actions'; }
  function fmtDur(j) { return j == null ? '—' : (j === 0 ? '< 1 j' : j + ' j'); }

  var recentBody = document.getElementById('trj-recent');
  if (recentBody) {
    var recent = DATA.filter(function (t) { return t.p !== 0; })
      .sort(function (a, b) { return a.d < b.d ? 1 : (a.d > b.d ? -1 : 0); })
      .slice(0, 5);
    var rhtml = '';
    for (var k = 0; k < recent.length; k++) {
      var rt = recent[k];
      var rcls = rt.p > 0 ? 'pos' : (rt.p < 0 ? 'neg' : 'be');
      var rsens = rt.s === 'LONG' ? 'long' : 'short';
      rhtml += '<tr>'
        + '<td class="r-asset">' + esc(rt.a) + '</td>'
        + '<td class="r-date">' + fmtDate(rt.d) + '</td>'
        + '<td class="r-sens ' + rsens + '">' + esc(rt.s) + '</td>'
        + '<td class="r-pct ' + rcls + '">' + fmtPct(rt.p) + '</td>'
        + '</tr>';
    }
    recentBody.innerHTML = rhtml;
  }

  var topBody = document.getElementById('trj-top');
  if (topBody) {
    var top = DATA.slice()
      .sort(function (a, b) { return b.p - a.p; })
      .slice(0, 30);
    var thtml = '';
    for (var q = 0; q < top.length; q++) {
      var tt = top[q];
      var tsens = tt.s === 'LONG' ? 'long' : 'short';
      var medal = q < 3 ? ' tt-top3' : '';
      thtml += '<tr' + (q >= 5 ? ' class="tt-hidden"' : '') + '>'
        + '<td class="tt-rank' + medal + '">' + (q + 1) + '</td>'
        + '<td class="tt-asset">' + esc(tt.a) + '</td>'
        + '<td class="tt-date">' + fmtDate(tt.d) + '</td>'
        + '<td class="tt-sens ' + tsens + '">' + esc(tt.s) + '</td>'
        + '<td class="tt-pct pos">' + fmtPct(tt.p) + '</td>'
        + '<td class="tt-dur">' + fmtDur(tt.j) + '</td>'
        + '</tr>';
    }
    topBody.innerHTML = thtml;

    var topToggle = document.getElementById('top-toggle');
    if (topToggle && top.length > 5) {
      topToggle.addEventListener('click', function () {
        var expanded = topBody.classList.toggle('tt-expanded');
        topToggle.classList.toggle('open', expanded);
        topToggle.querySelector('span').textContent = expanded ? 'Réduire' : 'Voir le top 30';
        if (!expanded) {
          var anchor = document.getElementById('top30');
          if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else if (topToggle) {
      topToggle.style.display = 'none';
    }
  }

  function filtered() {
    return DATA.filter(function (t) {
      if (state.market !== 'all' && t.m !== state.market) return false;
      if (state.sens !== 'all' && t.s !== state.sens) return false;
      if (state.result !== 'all' && t.r !== state.result) return false;
      if (state.query && t.a.toLowerCase().indexOf(state.query) === -1) return false;
      return true;
    });
  }

  function sorted(rows) {
    var r = rows.slice();
    if (state.sort === 'perf') r.sort(function (a, b) { return b.p - a.p; });
    else if (state.sort === 'perf-asc') r.sort(function (a, b) { return a.p - b.p; });
    else r.sort(function (a, b) { return a.d < b.d ? 1 : (a.d > b.d ? -1 : 0); });
    return r;
  }

  function render() {
    var rows = sorted(filtered());
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var t = rows[i];
      var cls = t.p > 0 ? 'pos' : (t.p < 0 ? 'neg' : 'be');
      var sensCls = t.s === 'LONG' ? 'trj-long' : (t.s === 'SHORT' ? 'trj-short' : '');
      html += '<tr>'
        + '<td><span class="trj-asset">' + esc(t.a) + '</span></td>'
        + '<td class="trj-mono">' + fmtDate(t.d) + '</td>'
        + '<td><span class="trj-mkt trj-mkt-' + esc(t.m) + '">' + marketLabel(t.m) + '</span></td>'
        + '<td><span class="trj-sens ' + sensCls + '">' + esc(t.s) + '</span></td>'
        + '<td class="trj-mono trj-pct ' + cls + '">' + fmtPct(t.p) + '</td>'
        + '<td class="trj-mono trj-dur">' + fmtDur(t.j) + '</td>'
        + '</tr>';
    }
    tbody.innerHTML = html;

    var n = rows.length;
    var wins = 0, realized = 0, sum = 0;
    for (var j = 0; j < rows.length; j++) {
      if (rows[j].r === 'win') wins++;
      if (rows[j].p !== 0) { realized++; sum += rows[j].p; }
    }
    var wr = n ? Math.round(wins / n * 100) : 0;
    var avg = realized ? sum / realized : 0;
    if (els.count) els.count.textContent = n + (n > 1 ? ' trades' : ' trade');
    if (els.stats) {
      els.stats.innerHTML = '<span><b>' + n + '</b> lignes affichées</span>'
        + '<span><b>' + wr + '%</b> gagnants</span>'
        + '<span>perf. moyenne <b class="' + (avg >= 0 ? 'pos' : 'neg') + '">' + fmtPct(avg) + '</b></span>';
    }
    if (els.note) {
      els.note.textContent = 'Les 259 opérations clôturées depuis janvier 2024. Une ligne à 0,0% ne porte pas de résultat propre : la stratégie enchaîne entrées et sorties partielles, et le gain est porté par la ligne de sortie correspondante. Ces lignes sont donc exclues de la performance moyenne. Le statut gagnant, break-even ou perdant de la répartition ci-dessus est celui du trade, pas celui d\'une ligne isolée.';
    }
  }

  function bindSeg(groupId, key) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-v]');
      if (!btn) return;
      state[key] = btn.getAttribute('data-v');
      group.querySelectorAll('[data-v]').forEach(function (b) { b.classList.toggle('active', b === btn); });
      render();
    });
  }

  bindSeg('trj-f-market', 'market');
  bindSeg('trj-f-sens', 'sens');
  bindSeg('trj-f-result', 'result');

  if (els.search) els.search.addEventListener('input', function () {
    state.query = this.value.trim().toLowerCase(); render();
  });
  if (els.sort) els.sort.addEventListener('change', function () { state.sort = this.value; render(); });

  render();
})();
