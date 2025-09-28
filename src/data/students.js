// Synthetic "big database" of students with photos and geo coords near a campus
// This keeps the app self-contained while providing realistic data to render.

const BASE = { lat: 37.4275, lng: -122.1697 } // Stanford-ish center

const majors = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
  'Economics', 'Psychology', 'Electrical Engineering', 'Statistics'
]

const coursePool = [
  'CS 106B', 'CS 229', 'CS 224N', 'MATH 51', 'MATH 104', 'PHYSICS 21',
  'BIO 82', 'CHEM 33', 'EE 263', 'STATS 116', 'CS 147', 'CS 230'
]

const locations = [
  'Green Library', 'Gates Building', 'Huang Engineering', 'Terman Park',
  'Main Quad', 'Tresidder', 'Lathrop Library', 'Clark Center', 'Memorial Court'
]

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function jitterCoord(base, meters = 400) {
  // Rough meters to degrees
  const dx = (Math.random() - 0.5) * (meters / 111320) * 2
  const dy = (Math.random() - 0.5) * (meters / 111320) * 2
  return { lat: base.lat + dy, lng: base.lng + dx }
}

function buildStudent(i) {
  const nameFirst = ['Alex','Sam','Jordan','Taylor','Casey','Riley','Morgan','Drew','Maya','Ari','Jamie','Chris','Devin','Sky','Rowan']
  const nameLast = ['Rivera','Chen','Kim','Patel','Lopez','Nguyen','Garcia','Wong','Lee','Hernandez','Khan','Singh']
  const name = `${rand(nameFirst)} ${rand(nameLast)}`
  const major = rand(majors)
  const year = rand(['Freshman','Sophomore','Junior','Senior'])
  const courses = Array.from({ length: 3 }, () => rand(coursePool))
  const { lat, lng } = jitterCoord(BASE)
  const photo = `https://i.pravatar.cc/300?img=${(i % 70) + 1}`
  const compatibility = Math.floor(70 + Math.random() * 30)
  const location = rand(locations)
  return {
    id: i + 1,
    name,
    major,
    year,
    courses,
    studyStyle: rand(['Visual','Problem Solver','Conceptual','Hands-on']),
    availability: rand(['Mornings','Afternoons','Evenings','Flexible']),
    location,
    photo,
    lat,
    lng,
    compatibility,
  }
}

export const students = Array.from({ length: 80 }, (_, i) => buildStudent(i))

export default students

