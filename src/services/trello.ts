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

export interface TrelloBoard {
  id: string;
  name: string;
}

export interface TrelloListBasic {
  id: string;
  name: string;
}

export interface TrelloCardBasic {
  id: string;
  name: string;
  url: string;
}

export interface TrelloAttachment {
    id: string;
    bytes: number;
    date: string; 
    fileName: string;
    mimeType: string;
    url: string;
}


function getTrelloAuthParams() {
    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey || !apiToken) {
        throw new Error('Trello API key or token not configured in .env file.');
    }
    return `key=${apiKey}&token=${apiToken}`;
}

export async function getBoardSummary(boardId: string): Promise<TrelloBoardSummary> {
  const authParams = getTrelloAuthParams();
  const url = `https://api.trello.com/1/boards/${boardId}?lists=open&cards=open&card_fields=name,due&list_fields=name&fields=name&${authParams}`;

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

export async function getMemberBoards(): Promise<TrelloBoard[]> {
  const authParams = getTrelloAuthParams();
  const url = `https://api.trello.com/1/members/me/boards?fields=name&${authParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API Error (getMemberBoards):', errorText);
      throw new Error(`Failed to fetch Trello boards: ${response.statusText}`);
    }
    const data = await response.json();
    return data as TrelloBoard[];
  } catch (error) {
    console.error('Error fetching boards from Trello:', error);
    throw new Error('An error occurred while communicating with the Trello API.');
  }
}

export async function getBoardLists(boardId: string): Promise<TrelloListBasic[]> {
  const authParams = getTrelloAuthParams();
  const url = `https://api.trello.com/1/boards/${boardId}/lists?fields=name&${authParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API Error (getBoardLists):', errorText);
      throw new Error(`Failed to fetch Trello lists: ${response.statusText}`);
    }
    const data = await response.json();
    return data as TrelloListBasic[];
  } catch (error) {
    console.error('Error fetching lists from Trello:', error);
    throw new Error('An error occurred while communicating with the Trello API.');
  }
}

export async function getCardsInList(listId: string): Promise<TrelloCardBasic[]> {
  const authParams = getTrelloAuthParams();
  const url = `https://api.trello.com/1/lists/${listId}/cards?fields=name,id,url&${authParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API Error (getCardsInList):', errorText);
      throw new Error(`Failed to fetch Trello cards: ${response.statusText}`);
    }
    const data = await response.json();
    return data as TrelloCardBasic[];
  } catch (error) {
    console.error('Error fetching cards from Trello:', error);
    throw new Error('An error occurred while communicating with the Trello API.');
  }
}

export async function getCardAttachments(cardId: string): Promise<TrelloAttachment[]> {
  const authParams = getTrelloAuthParams();
  const url = `https://api.trello.com/1/cards/${cardId}/attachments?fields=id,name,url,bytes,mimeType,date&${authParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API Error (getCardAttachments):', errorText);
      throw new Error(`Failed to fetch Trello card attachments: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((att: any) => ({...att, fileName: att.name})) as TrelloAttachment[];
  } catch (error) {
    console.error('Error fetching attachments from Trello:', error);
    throw new Error('An error occurred while communicating with the Trello API.');
  }
}
