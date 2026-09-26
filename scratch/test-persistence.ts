import { StoryRepository } from '../src/lib/db/repository';

async function main() {
  const repo = new StoryRepository();
  const list = await repo.getContributionsByDay('day-001');
  console.log('Total de contribuciones persistidas en la DB:', list.length);
  if (list.length > 0) {
    console.log('Ejemplo de comentario persistido:', {
      sequence: list[0].capture_sequence,
      author_name: list[0].author_name,
      author_handle: list[0].author_handle,
      avatar_url: list[0].avatar_url,
      code: list[0].daily_comment_code,
      original_text: list[0].original_text.slice(0, 50) + '...',
      is_valid: list[0].is_valid,
      word_count: list[0].word_count,
    });
  }
}

main().catch(console.error);
