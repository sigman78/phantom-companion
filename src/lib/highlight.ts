export const NEG_CONDITIONS = [
  'Knocked Down', 'Weakened', 'Burning', 'Bleeding',
  'Stunned', 'Blinded', 'Vulnerable', 'Frozen',
];

export const POS_CONDITIONS = ['Invisible', 'Resilient', 'Vengeful', 'Barrier'];

export const ACTION_VERBS = 'Attack|Move|Retreat|Leap|Guard|Heal|Range';

export function highlight(text: string): string {
  // Escape HTML first
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Die references — most specific first to avoid inner words matching action verb regex
  s = s.replace(/Blitz Attack die/g, '<span class="kw-die kw-die-yellow">Blitz Attack die</span>');
  s = s.replace(/Basic Attack die/g, '<span class="kw-die kw-die-cyan">Basic Attack die</span>');
  s = s.replace(/Accuracy die/g,     '<span class="kw-die kw-die-red">Accuracy die</span>');

  // Action verb + number e.g. "Attack -2", "Retreat 3", "Leap 4", "Range 5"
  s = s.replace(
    new RegExp(`\\b(${ACTION_VERBS})(\\s+[+-]?\\d+)`, 'g'),
    '<span class="kw-action">$1$2</span>'
  );

  // Condition badges — longest first to avoid partial matches
  [...NEG_CONDITIONS].sort((a, b) => b.length - a.length).forEach(kw => {
    s = s.replace(new RegExp(kw, 'g'), `<span class="kw-neg">${kw}</span>`);
  });
  [...POS_CONDITIONS].sort((a, b) => b.length - a.length).forEach(kw => {
    s = s.replace(new RegExp(kw, 'g'), `<span class="kw-pos">${kw}</span>`);
  });

  return s;
}
