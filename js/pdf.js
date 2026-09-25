(function () {
  const S = window.SFJStats;
  
  const PAGE = { w: 210, h: 297, l: 15, r: 15, t: 20, b: 16 };
  const BRAND = [29, 78, 216];      // #1d4ed8
  const BRAND_DARK = [15, 42, 107]; // #0f2a6b
  const MUTED = [103, 113, 140];    // #67718c
  const INK = [28, 35, 51];         // #1c2333
  const AMBER = [180, 83, 9];       // plan / yet_to_start tag
  const RED = [220, 38, 38];        // not_active tag
  const GREEN = [22, 101, 52];
  
  let doc;
  let y;
  let pageNum = 1;
  
  function setColor(rgb) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }
  
  function newPage() {
    doc.addPage();
    pageNum++;
    y = PAGE.t;
  }
  
  function need(mm) {
    if (y + mm > PAGE.h - PAGE.b) newPage();
  }
  
  function drawText(text, size = 10, style = "normal", indent = 0, color = INK) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    setColor(color);
    const chunks = doc.splitTextToSize(
      String(text == null ? "" : text),
      PAGE.w - PAGE.l - PAGE.r - indent
    );
    const lh = size * 0.45 + 1.5;
    for (const ch of chunks) {
      need(lh);
      doc.text(ch, PAGE.l + indent, y);
      y += lh;
    }
  }
  
  function gap(mm) {
    y += mm;
  }
  
  // Headings rely purely on size/weight/color/whitespace — no rule lines, no boxes.
  function sectionTitle(text) {
    need(16);
    gap(10);
    drawText(text.toUpperCase(), 15, "bold", 0, BRAND_DARK);
    gap(5);
  }
  
  function subTitle(text) {
    need(10);
    gap(4);
    drawText(text, 10.5, "bold", 0, BRAND);
    gap(2);
  }
  
  function statusLabel(status) {
    if (!status || status === "active") return null;
    const map = {
      plan: ["Plan to start", AMBER],
      yet_to_start: ["Yet to start", AMBER],
      not_active: ["Not active", RED],
      converted: ["Converted", GREEN],
      baptised: ["Baptised", BRAND],
      backslidden: ["Backslidden", RED]
    };
    return map[status] || [status.replace(/_/g, " "), MUTED];
  }
  
  function estimateCellHeight(cell, members) {
    let h = 6 + 5;
    if (members.length) {
      const names = members.map((m) => m.name).join(", ");
      const lines = doc.splitTextToSize(names, PAGE.w - PAGE.l - PAGE.r - 4);
      h += lines.length * 4.9;
    }
    return h + 6;
  }
  
  function cellCard(cell, members) {
    const est = estimateCellHeight(cell, members);
    need(est);
  
    const label = statusLabel(cell.status);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setColor(INK);
    doc.text(cell.name || "Untitled Cell", PAGE.l, y);
    if (label) {
      const nameW = doc.getTextWidth(cell.name || "Untitled Cell");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      setColor(label[1]);
      doc.text("·  " + label[0], PAGE.l + nameW + 4, y);
    }
    y += 5.5;
  
    const meta = [];
    if (cell.day) meta.push(cell.day);
    if (cell.time) meta.push(cell.time);
    if (cell.leader) meta.push("Leader: " + cell.leader);
    if (cell.shepherd) meta.push("Shepherd: " + cell.shepherd);
    if (cell.capacity) meta.push("Capacity: " + cell.capacity);
    if (meta.length) drawText(meta.join("    "), 9.5, "italic", 0, MUTED);
  
    if (members.length) {
      const names = members
        .map((m) => (m.standard ? m.name + " (" + m.standard + ")" : m.name))
        .join(", ");
      drawText("Members (" + members.length + "):  " + names, 9.5, "normal", 0, INK);
    }
    gap(6);
  }
  
  function renderCellCategory(title, cells, members) {
    const live = cells.filter((c) => c.status !== "not_active");
    const inactive = cells.filter((c) => c.status === "not_active");
    if (!live.length && !inactive.length) return;
  
    sectionTitle(title + "  ·  " + cells.length);
    if (live.length) {
      live.forEach((c) => cellCard(c, members.filter((m) => m.cellId === c.cellId)));
    } else {
      drawText("None yet.", 9.5, "italic", 0, MUTED);
    }
    if (inactive.length) {
      subTitle("Not active");
      inactive.forEach((c) => cellCard(c, members.filter((m) => m.cellId === c.cellId)));
    }
  }
  
  function twoColumnNames(title, items) {
    if (!items.length) return;
    sectionTitle(title + "  ·  " + items.length);
    const colW = (PAGE.w - PAGE.l - PAGE.r - 8) / 2;
    const col2X = PAGE.l + colW + 8;
    const rows = Math.ceil(items.length / 2);
    const lh = 7;
    need(rows * lh);
    const startY = y;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setColor(INK);
    for (let i = 0; i < items.length; i++) {
      const col = i < rows ? 0 : 1;
      const row = i < rows ? i : i - rows;
      const x = col === 0 ? PAGE.l : col2X;
      const yy = startY + row * lh;
      doc.text(items[i].name || "", x, yy);
    }
    y = startY + rows * lh + 4;
  }
  
  function renderFollowUp(items) {
    if (!items.length) return;
    sectionTitle("Follow Up Students  ·  " + items.length);
    items.forEach((it) => {
      need(7);
      const label = statusLabel(it.status);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      setColor(INK);
      doc.text(it.name || "", PAGE.l, y);
      if (label) {
        const w = doc.getTextWidth(it.name || "");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        setColor(label[1]);
        doc.text("·  " + label[0], PAGE.l + w + 4, y);
      }
      y += 6.5;
    });
    gap(3);
  }
  
  function renderPrayerPoints(points) {
    const sorted = [...points].sort((a, b) => (a.order || 0) - (b.order || 0));
    sectionTitle("Prayer for Youth  ·  " + sorted.length + " points");
    if (!sorted.length) {
      drawText("No prayer points yet.", 9.5, "italic", 0, MUTED);
      return;
    }
    sorted.forEach((p) => {
      need(11);
      drawText((p.order ? p.order + ".  " : "") + p.title, 11.5, "bold", 0, INK);
      if (p.summary) drawText(p.summary, 9.8, "normal", 4, INK);
      if (p.scripture) drawText(p.scripture, 9.5, "italic", 4, [138, 109, 31]);
      gap(5);
    });
  }
  
  function renderKpiSummary(data, counts) {
    sectionTitle("Overview");
    const rows = [
      ["Total Prayer Cells", counts.totalCells],
      ["Active Cells", counts.active],
      ["Plan", counts.plan],
      ["Yet to Start", counts.yet],
      ["Members", (data.members || []).length],
      ["Shepherds", (data.sheperds || []).length],
      ["Leaders", (data.leaders || []).length],
      ["Follow-up Students", (data.followup || []).length],
      ["Prayer Points", (data.prayerpoints || []).length]
    ];
    const colW = (PAGE.w - PAGE.l - PAGE.r) / 2;
    rows.forEach((r, i) => {
      const col = i % 2;
      const x = PAGE.l + col * colW;
      if (col === 0) need(15);
      const rowY = y;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setColor(MUTED);
      doc.text(r[0], x, rowY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      setColor(BRAND);
      doc.text(String(r[1]), x, rowY + 8);
      if (col === 1) y = rowY + 15;
    });
    if (rows.length % 2 === 1) y += 15;
    gap(5);
  }
  
  function drawCover() {
    doc.setFillColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
    doc.rect(0, 0, PAGE.w, 90, "F");
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("SFJ Prayer Cells", PAGE.w / 2, 45, { align: "center" });
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text("2026–2027  ·  Chennai", PAGE.w / 2, 57, { align: "center" });
  
    doc.setFontSize(11);
    doc.text("Students for Jesus", PAGE.w / 2, 71, { align: "center" });
  
    y = 115;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(13);
    setColor(INK);
    doc.text("Pray for Mission 100 & Reaching Chennai students!", PAGE.w / 2, y, { align: "center" });
  
    y = 260;
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setColor(MUTED);
    doc.text("Generated " + dateStr, PAGE.w / 2, y, { align: "center" });
  }
  
  function addHeadersAndFooters() {
    const total = doc.internal.getNumberOfPages();
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setColor(MUTED);
      doc.text("SFJ Prayer Cells 2026–2027", PAGE.l, 10);
      doc.text(dateStr, PAGE.w - PAGE.r, 10, { align: "right" });
      doc.text("Page " + (i - 1) + " of " + (total - 1), PAGE.w / 2, PAGE.h - 8, { align: "center" });
    }
  }
  
  function renderReport(data) {
    const cells = data.cells || [];
    const members = data.members || [];
  
    const byCat = (cat) => cells.filter((c) => c.category === cat);
    const students = byCat("student");
    const bachelors = byCat("bachelor");
    const institutes = byCat("institute");
  
    const counts = {
      totalCells: cells.filter((c) => c.status !== "not_active").length,
      active: cells.filter((c) => c.status === "active").length,
      plan: cells.filter((c) => c.status === "plan").length,
      yet: cells.filter((c) => c.status === "yet_to_start").length
    };
  
    drawCover();
  
    newPage();
    renderKpiSummary(data, counts);
  
    renderCellCategory("Student Prayer Cells", students, members);
    renderCellCategory("Bachelor Prayer Cells", bachelors, members);
    renderCellCategory("Institutes — Plan to Start", institutes, members);
  
    twoColumnNames("Shepherds", data.sheperds || []);
    twoColumnNames("Prayer Cell Leaders", data.leaders || []);
  
    renderFollowUp(data.followup || []);
    renderPrayerPoints(data.prayerpoints || []);
  
    addHeadersAndFooters();
  }
  
  async function downloadPdf() {
    const btn = document.getElementById("btnDownloadPdf");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Generating…";
    try {
      if (!window.jspdf) throw new Error("PDF library not loaded");
      const { jsPDF } = window.jspdf;
      doc = new jsPDF("p", "mm", "a4");
      pageNum = 1;
      y = PAGE.t;
      const data = window._sfjData || (await S.loadAll());
      renderReport(data);
      doc.save("SFJ_Prayer_Cells_2026-2027.pdf");
      toast("PDF downloaded ✓");
    } catch (err) {
      toast("PDF failed: " + err.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnDownloadPdf");
    if (btn) btn.addEventListener("click", downloadPdf);
  });
  
  })();