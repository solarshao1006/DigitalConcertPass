from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMG_ROOT = ROOT / "public" / "imgs"
PASS_ROOT = IMG_ROOT / "pass"

BACKGROUND_SIZE = (360, 436)
THUMBNAIL_SIZE = (180, 220)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_background(src: Path, dest: Path) -> None:
    ensure_dir(dest.parent)
    with Image.open(src) as img:
      converted = img.convert("RGB")
      fitted = ImageOps.fit(converted, BACKGROUND_SIZE, method=Image.Resampling.LANCZOS)
      fitted.save(dest, format="PNG", optimize=True)


def save_thumbnail(src: Path, dest: Path) -> None:
    ensure_dir(dest.parent)
    with Image.open(src) as img:
      converted = img.convert("RGB")
      fitted = ImageOps.fit(converted, THUMBNAIL_SIZE, method=Image.Resampling.LANCZOS)
      fitted.save(dest, format="PNG", optimize=True)


def main() -> None:
    backgrounds = sorted(IMG_ROOT.glob("grandline*_bg.jpg"))
    posters = sorted([p for p in IMG_ROOT.glob("grandline*/*.jpg") if p.is_file()])

    for src in backgrounds:
        dest = PASS_ROOT / src.with_suffix(".png").name
        save_background(src, dest)
        print(f"background -> {dest.relative_to(ROOT)}")

    for src in posters:
        relative_parent = src.parent.name
        dest = PASS_ROOT / relative_parent / f"{src.stem}.png"
        save_thumbnail(src, dest)
        print(f"thumbnail -> {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
