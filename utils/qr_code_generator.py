import sys
import qrcode

def generate_qr(url, output_file="qr_code.png"):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4, 
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_file)
    print(f"QR code for {url} saved as {output_file}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python qr_generator.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    generate_qr(url)

if __name__ == "__main__":
    main()