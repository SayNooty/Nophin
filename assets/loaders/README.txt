Иконки загрузчиков для Nophin
=============================

Положите картинки в эту папку (assets/loaders/) со следующими именами:

  forge.png      — Forge
  fabric.png     — Fabric
  neoforge.png   — NeoForge
  quilt.png      — Quilt
  optifine.png   — OptiFine
  iris.png       — Iris
  vanilla.png    — Ванила
  canvas.png     — Canvas
  paper.png      — Paper
  spigot.png     — Spigot
  bukkit.png     — Bukkit
  folia.png      — Folia
  purpur.png     — Purpur
  sponge.png     — Sponge

Рекомендации: PNG или WEBP, квадратные, 64x64 или 128x128, прозрачный фон.
Иконки показываются в фильтре «Загрузчик», в редакторе проекта и в чипах на карточках.

Если файла нет — автоматически показывается встроенный SVG-логотип:
ошибок и «битых» картинок не будет. Добавлять файлы можно по одному.

Путь, расширение и имена файлов настраиваются в index.html:
  const LOADER_ICON_DIR = 'assets/loaders/';
  const LOADER_ICON_EXT = '.png';
  const LOADER_ICON_FILES = { forge:'forge', fabric:'fabric', ... };

Поддерживаются и другие форматы: укажите, например, LOADER_ICON_EXT = '.webp'
или поменяйте имена в LOADER_ICON_FILES (например, neoforge: 'neo-forge').
