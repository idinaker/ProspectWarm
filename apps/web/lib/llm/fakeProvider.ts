export interface FakeComment {
  type: 'supportive_additive' | 'insightful_question' | 'respectful_contrarian';
  text: string;
}

export function generateFakeComments(postText: string): FakeComment[] {
  const excerpt = postText.length > 80 ? `${postText.slice(0, 77)}...` : postText;

  return [
    {
      type: 'supportive_additive',
      text: `Great point in your post about "${excerpt}". One practical addition is to include a concrete before/after example.`
    },
    {
      type: 'insightful_question',
      text: `Interesting take on "${excerpt}". What signal tells you this is working earlier in the process?`
    },
    {
      type: 'respectful_contrarian',
      text: `Helpful perspective on "${excerpt}". One caveat is that this can vary by buyer maturity and deal complexity.`
    }
  ];
}
