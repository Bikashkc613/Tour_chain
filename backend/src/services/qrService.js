// backend/src/services/qrService.js
const QRCode = require('qrcode')
const crypto = require('crypto')

async function generateQR(placeId, secret) {
  // QR contains: placeId + timestamp-signed token
  // This makes each QR unique per day (anti-cheat)
  const today = new Date().toISOString().split('T')[0] // "2024-01-15"
  const token = crypto.createHmac('sha256', secret)
    .update(`${placeId}:${today}`)
    .digest('hex')
    .substring(0, 16)
  
  const qrData = `tcn:${placeId}:${today}:${token}`
  const qrImage = await QRCode.toDataURL(qrData)
  return { qrData, qrImage }
}

function verifyQR(qrData, secret) {
  const parts = qrData.split(':')
  if (parts[0] !== 'tcn' || parts.length !== 4) return false
  const [, placeId, date, token] = parts
  
  // Check date is today (within 1 day tolerance)
  const qrDate = new Date(date)
  const now = new Date()
  const diffDays = Math.abs((now - qrDate) / (1000 * 60 * 60 * 24))
  if (diffDays > 1) return false
  
  // Verify token
  const expected = crypto.createHmac('sha256', secret)
    .update(`${placeId}:${date}`)
    .digest('hex')
    .substring(0, 16)
  return token === expected
}

module.exports = { generateQR, verifyQR }
