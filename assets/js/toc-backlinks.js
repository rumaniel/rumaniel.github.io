// Wiki-style section numbers: for each entry in a `.toc-table`, prefix the
// target heading with its number, linking back to the table of contents.
(function () {
  function init() {
    var toc = document.querySelector(".post-content table.toc-table");
    if (!toc) return;
    if (!toc.id) toc.id = "toc";

    var links = toc.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var num = links[i].querySelector(".toc-num");
      var id = decodeURIComponent(links[i].getAttribute("href").slice(1));
      var heading = document.getElementById(id);
      if (!num || !heading || heading.querySelector(".heading-num")) continue;

      var back = document.createElement("a");
      back.className = "heading-num";
      back.href = "#" + toc.id;
      back.title = "TOC";
      back.textContent = num.textContent + ".";
      heading.insertBefore(back, heading.firstChild);
      heading.insertBefore(document.createTextNode(" "), back.nextSibling);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
