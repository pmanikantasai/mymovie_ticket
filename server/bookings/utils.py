import os
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_ticket_qr(booking):
    # Data to encode
    seat_numbers = [s.seat_number for s in booking.seats.all()]
    qr_data = f"Booking ID: {booking.booking_id}\nMovie: {booking.show.movie.title}\nShow: {booking.show.show_time.strftime('%Y-%m-%d %H:%M')}\nTheater: {booking.show.theater.name}\nSeats: {', '.join(seat_numbers)}\nAmount: Rs. {booking.total_amount}"
    
    # Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save image to BytesIO
    buffer = BytesIO()
    img.save(buffer)
    filename = f"qr_{booking.booking_id}.png"
    
    # Save to model
    booking.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)

def generate_ticket_pdf(booking):
    # Ensure media directories exist
    os.makedirs(os.path.join(settings.MEDIA_ROOT, 'qr_codes'), exist_ok=True)
    os.makedirs(os.path.join(settings.MEDIA_ROOT, 'tickets'), exist_ok=True)
    
    # First generate the QR Code if it doesn't exist
    if not booking.qr_code:
        generate_ticket_qr(booking)
        booking.save()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#f84464'), # BMS Neon Crimson
        spaceAfter=15,
        alignment=1 # Center
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#777777')
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#222222'),
        fontName='Helvetica-Bold'
    )

    # Header section
    story.append(Paragraph("BOOKMYSHOW TICKET RECEIPT", title_style))
    story.append(Spacer(1, 10))
    
    # Movie Details Box
    movie_title_style = ParagraphStyle(
        'MovieTitleStyle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#1f2937'),
        fontName='Helvetica-Bold'
    )
    
    movie_data = [
        [Paragraph(f"<b>Movie:</b> {booking.show.movie.title}", movie_title_style), ''],
        [Paragraph("Theater", label_style), Paragraph("Show Time", label_style)],
        [Paragraph(booking.show.theater.name, value_style), Paragraph(booking.show.show_time.strftime('%Y-%m-%d %H:%M'), value_style)],
        [Paragraph("Screen", label_style), Paragraph("Seats", label_style)],
        [Paragraph(f"Screen {booking.show.screen_number}", value_style), Paragraph(", ".join([s.seat_number for s in booking.seats.all()]), value_style)]
    ]
    
    movie_table = Table(movie_data, colWidths=[250, 250])
    movie_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (1, 0)),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 2),
        ('BOTTOMPADDING', (0, 3), (-1, 3), 2),
    ]))
    
    story.append(movie_table)
    story.append(Spacer(1, 20))
    
    # Price breakdown and QR Code side-by-side
    base_price = booking.total_amount - booking.convenience_fee - booking.tax
    price_data = [
        [Paragraph("Base Ticket Price", label_style), Paragraph(f"Rs. {base_price:.2f}", value_style)],
        [Paragraph("Convenience Fee", label_style), Paragraph(f"Rs. {booking.convenience_fee:.2f}", value_style)],
        [Paragraph("Tax (GST 18%)", label_style), Paragraph(f"Rs. {booking.tax:.2f}", value_style)],
        [Paragraph("<b>Total Paid</b>", value_style), Paragraph(f"<b>Rs. {booking.total_amount:.2f}</b>", value_style)],
    ]
    price_table = Table(price_data, colWidths=[180, 100])
    price_table.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.HexColor('#1f2937')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef2f2')),
    ]))
    
    # QR Code image
    qr_path = booking.qr_code.path
    qr_img = Image(qr_path, width=120, height=120)
    
    # Layout table combining Price breakdown and QR code
    layout_data = [
        [price_table, qr_img]
    ]
    layout_table = Table(layout_data, colWidths=[300, 200])
    layout_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(layout_table)
    story.append(Spacer(1, 30))
    
    # Footer guidelines
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#9ca3af'),
        alignment=1
    )
    story.append(Paragraph("Please carry this receipt along with a valid ID proof to the theater.", footer_style))
    story.append(Paragraph("Tickets once booked cannot be cancelled or refunded.", footer_style))
    story.append(Paragraph("Thank you for booking with BookMyShow!", footer_style))
    
    doc.build(story)
    
    # Save PDF to model
    filename = f"ticket_{booking.booking_id}.pdf"
    booking.pdf_ticket.save(filename, ContentFile(buffer.getvalue()), save=False)
