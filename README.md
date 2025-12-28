# 🚀 HTML/CSS Tamil

**The World's First HTML & CSS Programming Language completely in Tamil.**

THTML bridges the digital divide by enabling millions of Tamil speakers to build modern, responsive, and professional websites using their native language. It is not just a translation map; it is a full-featured development environment with syntax highlighting, auto-completion, live preview, and embedded CSS support.

<div align="center">
  <img src="images/thtml_logo.png" width="150" alt="THTML Logo" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="images/tcss_logo.png" width="150" alt="TCSS Logo" />
</div>

## ✨ Key Features

- **HTML in Tamil (`.thtml`)**: Use `<தலை>`, `<உடல்>`, `<பிரிவு>` instead of `<head>`, `<body>`, `<div`.
- **CSS in Tamil (`.tcss`)**: Style your app with `வகுப்பு` (class), `நிறம்` (color), `பின்னணி` (background).
- **Full Flexbox & Grid Support**: Build complex layouts using native terms like `கூட்டம்` (flex) and `கட்டம்` (grid).
- **Embedded CSS**: Write Tamil CSS directly inside your HTML using `<பாணி>`.
- **Attributes in Tamil**: Use `வகுப்பு="..."` instead of `class="..."`.
- **Live Preview**: See your changes instantly with a built-in split-screen browser (Click the Play or Preview button).
- **IntelliSense**: Smart auto-completion for over **50+ HTML tags** and **100+ CSS properties**.
- **Real-time Error Diagnostics**: Instantly spots unknown tags with red squiggly lines to prevent mistakes.
- **Zero-Dependency Output**: Compiles to standard, optimized HTML5 & CSS3 that runs on any browser.

<br />

<img src="images/screenshot.png" alt="HTML/CSS Tamil Demo" width="100%" />

---

## 🛠️ Installation

1. Open **VS Code**.
2. Go to **Extensions** (Ctrl+Shift+X).
3. Search for **"THTML"** or "Tamil HTML".
4. Click **Install**.

---

## 🚀 Documentation

### 1. Basic Structure (`.thtml`)

Start by typing `thtml` and pressing Enter to get a full boilerplate.

```xml
<பக்கம்>
  <தலை>
    <தலைப்பு>My Website</தலைப்பு>
    <!-- External CSS Link -->
    <தொடுப்பு உறவு="stylesheet" முகவரி="style.tcss" />
  </தலை>
  <உடல்>
    <தலைப்பு1>வணக்கம்!</தலைப்பு1>
  </உடல்>
</பக்கம்>
```

### 2. Embedded CSS & Linking (`<பாணி>`)

You can write Tamil CSS directly inside your HTML. You can also import external files.

```xml
<பாணி>
   /* 1. Import External File */
   @இறக்குமதி "style.tcss";

   /* 2. Write Direct Styles */
   வகுப்பு_button {
      பின்புலம்: நீளம்;
      நிறம்: வெள்ளை;
      எல்லை_ஆரம்: 5px;
   }
</பாணி>
```

### 3. External CSS (`.tcss`)

Create a separate file (e.g., `style.tcss`) to keep your code clean.

```css
/* Select by Class (.box) */
வகுப்பு_box {
  அகலம்: 100%;
  உள்வெளி: 20px;
}

/* Select by ID (#main) */
அடையாளம்_main {
  பின்புலம்: சாம்பல்;
}

/* Pseudo-classes (:hover) */
வகுப்பு_box: சுட்டி_மேல் {
  பின்புலம்: சிவப்பு;
}
```

### 4. Running & Compiling

- **Compile**: Just save the file. The extension handles everything in memory.
- **Preview**: Click the **Run** button (▶️) or use the **Preview** command.

---

## ⚡ Code Snippets (குறுக்குவழிகள்)

Type these prefixes and press `Enter` to auto-generate code:

| Prefix             | Description          | Output                    |
| :----------------- | :------------------- | :------------------------ |
| `thtml`            | **HTML Boilerplate** | Full `<பக்கம்>` structure |
| `link-tcss`        | **Link CSS**         | `<தொடுப்பு ... />`        |
| `style-tcss`       | **Embedded CSS**     | `<பாணி> ... </பாணி>`      |
| `div-thtml`        | **Div Block**        | `<களம்> ... </களம்>`      |
| `img-thtml`        | **Image**            | `<படம் ... />`            |
| `input-thtml`      | **Input**            | `<உள்ளீடு ... />`         |
| `table-thtml`      | **Table**            | Full Table Structure      |
| `video-thtml`      | **Video Player**     | `<காணொளி> ...`            |
| `audio-thtml`      | **Audio Player**     | `<ஒலி> ...`               |
| `transition-tcss`  | **CSS Transition**   | Smooth Animations         |
| `transform-tcss`   | **CSS Transform**    | Rotate/Scale Elements     |
| `flex-center-tcss` | **Flex Center**      | Centers items (CSS)       |
| `media-tcss`       | **Media Query**      | Responsive Block          |

---

## 📚 Quick Reference (அகராதி)

### HTML Tags & Attributes

| Tamil         | English    | Description          |
| :------------ | :--------- | :------------------- |
| `<பக்கம்>`    | `<html>`   | Root Element         |
| `<தலை>`       | `<head>`   | Metadata Container   |
| `<உடல்>`      | `<body>`   | Visible Content      |
| `<களம்>`      | `<div>`    | Division / Container |
| `<தொடுப்பு>`  | `<link>`   | Link Resource        |
| `<காணொளி>`    | `<video>`  | Video Player         |
| `<ஒலி>`       | `<audio>`  | Audio Player         |
| `வகுப்பு`     | `class`    | Class Attribute      |
| `அடையாளம்`    | `id`       | ID Attribute         |
| `முகவரி`      | `href`     | URL / Reference      |
| `கட்டுப்பாடு` | `controls` | Media Controls       |
| `தானே_இயங்கு` | `autoplay` | Autoplay Media       |

### CSS Properties

| Tamil          | English      |
| :------------- | :----------- |
| `நிறம்`        | `color`      |
| `பின்புலம்`    | `background` |
| `எழுத்து_அளவு` | `font-size`  |
| `விளிம்பு`     | `margin`     |
| `உள்வெளி`      | `padding`    |
| `காட்சி`       | `display`    |
| `கூட்டம்`      | `flex`       |
| `மென்மாற்றம்`  | `transition` |
| `வடிவ_மாற்றம்` | `transform`  |

---

## 🏆 Credits

A huge thanks to our contributors!

- **PTharanan** ([@PTharanan](https://github.com/PTharanan)) - _Added Multimedia (Video/Audio) & CSS Animation support._

---

## ❤️ Contributions

This project is open-source! We welcome contributions from the community to expand the vocabulary and improve the compiler.

**Repository**: [https://github.com/Itz-mehanth/Tamil-HTML-CSS](https://github.com/Itz-mehanth/Tamil-HTML-CSS)  
**License**: MIT

---

_Made with ❤️ for the Tamil Tech Community._
