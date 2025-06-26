'use server';

interface TrelloCard {
  id: string;
  name: string;
  due: string | null;
}

interface TrelloList {
  id: string;
  name: string;
  cards: TrelloCard[];
}

export interface TrelloBoardSummary {
  name: string;
  lists: TrelloList[];
}

export async function getBoardSummary(boardId: string): Promise<TrelloBoardSummary> {
  const apiKey = process.env.TRELLO_API_KEY;
  const apiToken = process.env.TRELLO_API_TOKEN;

  if (!apiKey || !apiToken) {
    throw new Error('Trello API key or token not configured in .env file.');
  }

  const url = `https://api.trello.com/1/boards/${boardId}?lists=open&cards=open&card_fields=name,due&list_fields=name&fields=name&key=${apiKey}&token=${apiToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API Error:', errorText);
      throw new Error(`Failed to fetch Trello board data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as TrelloBoardSummary;
  } catch (error) {
    console.error('Error fetching from Trello:', error);
    throw new Error('An error occurred while communicating with the Trello API.');
  }
}
