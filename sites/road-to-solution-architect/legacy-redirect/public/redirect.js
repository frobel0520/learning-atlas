// 舊網址轉址（Harbor standards/deployment-templates/site-migration/redirect-guide.html 改寫）。
// 新網址的路徑結構與舊站相同，只多了 /learning-atlas/road-to-solution-architect 前綴，所以原路徑、查詢字串與 # 都帶過去。
// 從舊的主畫面圖示（standalone）開啟時不自動轉址，改顯示引導，讓使用者知道要重新加到主畫面。
(function () {
	var NEW_ORIGIN = "https://frobel0520.github.io";
	var NEW_BASE = "/learning-atlas/road-to-solution-architect";
	var target = NEW_ORIGIN + NEW_BASE + location.pathname + location.search + location.hash;
	var links = document.querySelectorAll("a[data-new-url]");
	for (var i = 0; i < links.length; i += 1) links[i].href = target;
	var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
	if (standalone) {
		document.documentElement.className = "show-guide";
	} else {
		location.replace(target);
	}
})();
