import { NextResponse } from 'next/server';

const templateData = [
  {
    "playerId": "example-player-1",
    "name": "選手名例1",
    "team": "チーム名例1",
    "position": "PG",
    "number": 1,
    "height": "6-3",
    "weight": "190lbs",
    "birthDate": "1995-01-01",
    "country": "USA",
    "imageUrl": "https://example.com/player1.jpg"
  },
  {
    "playerId": "example-player-2",
    "name": "選手名例2",
    "team": "チーム名例2",
    "position": "SG",
    "number": 2,
    "height": "6-5",
    "weight": "200lbs",
    "birthDate": "1996-02-02",
    "country": "Japan",
    "imageUrl": "https://example.com/player2.jpg"
  }
];

export async function GET() {
  const jsonString = JSON.stringify(templateData, null, 2);
  
  return new NextResponse(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="player-template.json"',
    },
  });
}
