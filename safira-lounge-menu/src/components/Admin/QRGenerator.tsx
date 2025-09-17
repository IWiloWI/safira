import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { 
  FaQrcode, 
  FaDownload, 
  FaPrint, 
  FaPlus,
  FaMinus,
  FaCopy,
  FaCheck
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const QRContainer = styled.div`
  max-width: 1000px;
`;

const QRHeader = styled.div`
  margin-bottom: 40px;
`;

const QRTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 65, 251, 0.8);
`;

const QRSubtitle = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const GeneratorSection = styled.div`
  background: rgba(255, 65, 251, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 40px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: 'Aldrich', sans-serif;
  color: #FF41FB;
  font-size: 1rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 25px;
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(135deg, #FF41FB, #ff21f5)'};
  border: 2px solid #FF41FB;
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 20px rgba(255, 65, 251, 0.4);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const QRPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const QRCard = styled(motion.div)`
  background: rgba(255, 65, 251, 0.08);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  display: inline-block;
`;

const QRImage = styled.canvas`
  max-width: 100%;
  height: auto;
`;

const TableNumber = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const QRUrl = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-all;
  margin-bottom: 15px;
`;

const QRActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const BulkSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid rgba(255, 65, 251, 0.3);
`;

const BulkControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const RangeInput = styled.input`
  width: 100px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 5px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  text-align: center;
`;

const QRGenerator: React.FC = () => {
  const { t } = useLanguage();
  const [tableNumber, setTableNumber] = useState('1');
  const [qrCodes, setQrCodes] = useState<{ table: string; url: string; canvas: HTMLCanvasElement }[]>([]);
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(10);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement }>({});

  const generateQR = useCallback(async (table: string) => {
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/table/${table}`;
    
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return { table, url: qrUrl, canvas };
  }, []);

  const handleGenerateSingle = async () => {
    if (!tableNumber.trim()) return;
    
    try {
      const qrData = await generateQR(tableNumber);
      setQrCodes(prev => {
        const filtered = prev.filter(qr => qr.table !== tableNumber);
        return [...filtered, qrData];
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleGenerateBulk = async () => {
    const start = Math.min(bulkStart, bulkEnd);
    const end = Math.max(bulkStart, bulkEnd);
    const tables = Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
    
    try {
      const qrPromises = tables.map(table => generateQR(table));
      const newQrCodes = await Promise.all(qrPromises);
      setQrCodes(prev => {
        const existingTables = prev.map(qr => qr.table);
        const filtered = prev.filter(qr => !tables.includes(qr.table));
        return [...filtered, ...newQrCodes];
      });
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
    }
  };

  const downloadQR = (qrData: { table: string; canvas: HTMLCanvasElement }) => {
    const link = document.createElement('a');
    link.download = `safira-table-${qrData.table}-qr.png`;
    link.href = qrData.canvas.toDataURL();
    link.click();
  };

  const downloadAllAsPDF = () => {
    if (qrCodes.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const qrSize = 60;
    const cols = Math.floor(pageWidth / (qrSize + 20));
    const rows = Math.floor((pageHeight - 40) / (qrSize + 30));
    const itemsPerPage = cols * rows;

    qrCodes.forEach((qrData, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        pdf.addPage();
      }

      const pageIndex = index % itemsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);
      
      const x = 20 + col * (qrSize + 10);
      const y = 30 + row * (qrSize + 20);

      // Add QR code
      const imgData = qrData.canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
      
      // Add table number
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Tisch ${qrData.table}`, x + qrSize / 2, y + qrSize + 8, { align: 'center' });
    });

    pdf.save('safira-qr-codes.pdf');
  };

  const copyUrl = async (url: string, table: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(table);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const printQR = (qrData: { table: string; canvas: HTMLCanvasElement }) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const imgData = qrData.canvas.toDataURL();
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Tisch ${qrData.table}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container { 
                page-break-inside: avoid; 
                margin-bottom: 30px; 
              }
              img { 
                max-width: 300px; 
                height: auto; 
                border: 2px solid #000; 
                padding: 10px; 
                background: white; 
              }
              h2 { 
                margin: 20px 0 10px; 
                font-size: 24px; 
                color: #000; 
              }
              p { 
                font-size: 12px; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Safira Lounge - Tisch ${qrData.table}</h2>
              <img src="${imgData}" alt="QR Code">
              <p>Scannen Sie diesen Code für die digitale Speisekarte</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <QRContainer>
      <QRHeader>
        <QRTitle>{t('admin.qrGenerator')}</QRTitle>
        <QRSubtitle>
          Erstellen Sie QR-Codes für Ihre Tische
        </QRSubtitle>
      </QRHeader>

      <GeneratorSection>
        <InputGroup>
          <Label>{t('admin.tableNumber')}</Label>
          <Input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="z.B. 1, A1, VIP-1"
          />
        </InputGroup>

        <ButtonGroup>
          <Button onClick={handleGenerateSingle}>
            <FaQrcode />
            {t('admin.generateQR')}
          </Button>
        </ButtonGroup>

        <BulkSection>
          <Label>Bulk-Generierung</Label>
          <BulkControls>
            <span style={{ color: 'white', fontFamily: 'Aldrich, sans-serif' }}>Von:</span>
            <RangeInput
              type="number"
              value={bulkStart}
              onChange={(e) => setBulkStart(parseInt(e.target.value) || 1)}
              min="1"
            />
            <span style={{ color: 'white', fontFamily: 'Aldrich, sans-serif' }}>Bis:</span>
            <RangeInput
              type="number"
              value={bulkEnd}
              onChange={(e) => setBulkEnd(parseInt(e.target.value) || 1)}
              min="1"
            />
            <Button onClick={handleGenerateBulk}>
              <FaPlus />
              Bulk Generieren
            </Button>
          </BulkControls>
        </BulkSection>

        {qrCodes.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <Button onClick={downloadAllAsPDF} variant="secondary">
              <FaDownload />
              Alle als PDF
            </Button>
          </div>
        )}
      </GeneratorSection>

      {qrCodes.length > 0 && (
        <QRPreview>
          {qrCodes.map((qrData, index) => (
            <QRCard
              key={qrData.table}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <QRCodeContainer>
                <canvas
                  ref={el => {
                    if (el) {
                      const ctx = el.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(qrData.canvas, 0, 0);
                      }
                    }
                  }}
                  width={200}
                  height={200}
                />
              </QRCodeContainer>
              
              <TableNumber>Tisch {qrData.table}</TableNumber>
              
              <QRUrl>{qrData.url}</QRUrl>
              
              <QRActions>
                <Button
                  onClick={() => copyUrl(qrData.url, qrData.table)}
                  variant="secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 15px' }}
                >
                  {copied === qrData.table ? <FaCheck /> : <FaCopy />}
                  {copied === qrData.table ? 'Kopiert!' : 'URL'}
                </Button>
                
                <Button
                  onClick={() => downloadQR(qrData)}
                  variant="secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 15px' }}
                >
                  <FaDownload />
                  PNG
                </Button>
                
                <Button
                  onClick={() => printQR(qrData)}
                  variant="secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 15px' }}
                >
                  <FaPrint />
                  Print
                </Button>
              </QRActions>
            </QRCard>
          ))}
        </QRPreview>
      )}
    </QRContainer>
  );
};

export default QRGenerator;