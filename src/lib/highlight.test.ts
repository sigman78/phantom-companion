import { describe, it, expect } from 'vitest';
import { highlight } from './highlight';

describe('highlight', () => {
  it('wraps negative conditions with kw-neg', () => {
    const result = highlight('Inflict Stunned on the target');
    expect(result).toContain('class="kw-neg"');
    expect(result).toContain('Stunned');
  });

  it('wraps multi-word negative condition (Knocked Down)', () => {
    const result = highlight('Target is Knocked Down');
    expect(result).toContain('class="kw-neg"');
    expect(result).toContain('Knocked Down');
  });

  it('wraps positive conditions with kw-pos', () => {
    const result = highlight('gain Invisible until end of turn');
    expect(result).toContain('class="kw-pos"');
    expect(result).toContain('Invisible');
  });

  it('wraps action verb + number with kw-action', () => {
    expect(highlight('Attack -2')).toContain('class="kw-action"');
    expect(highlight('Retreat 3')).toContain('class="kw-action"');
    expect(highlight('Move +1')).toContain('class="kw-action"');
  });

  it('wraps Accuracy die with kw-die-red', () => {
    const result = highlight('roll an Accuracy die');
    expect(result).toContain('kw-die-red');
    expect(result).toContain('Accuracy die');
  });

  it('wraps Blitz Attack die with kw-die-yellow', () => {
    const result = highlight('roll a Blitz Attack die');
    expect(result).toContain('kw-die-yellow');
    expect(result).toContain('Blitz Attack die');
  });

  it('wraps Basic Attack die with kw-die-cyan', () => {
    const result = highlight('roll a Basic Attack die');
    expect(result).toContain('kw-die-cyan');
    expect(result).toContain('Basic Attack die');
  });

  it('escapes HTML entities before processing', () => {
    const result = highlight('<b>Attack 3</b>');
    expect(result).toContain('&lt;b&gt;');
    expect(result).not.toContain('<b>');
  });

  it('does not double-match Blitz Attack die as both die and action verb', () => {
    const result = highlight('Blitz Attack die');
    // Die match should apply; kw-action should NOT wrap the inner "Attack"
    expect(result).toContain('kw-die-yellow');
    // kw-action wraps "verb + number" — "Blitz Attack die" has no trailing number
    expect(result).not.toContain('kw-action');
  });

  it('plain text with no keywords is returned unchanged (aside from HTML escaping)', () => {
    const result = highlight('Nothing special here');
    expect(result).toBe('Nothing special here');
  });

  it('wraps *text* with kw-em', () => {
    const result = highlight('Inflict *1 damage* on target');
    expect(result).toContain('<em class="kw-em">1 damage</em>');
  });

  it('converts [p] to paragraph break', () => {
    const result = highlight('First sentence. [p] Second sentence.');
    expect(result).toContain('<br>');
  });

  it('strips [icon:name] tags and collapses spaces', () => {
    const result = highlight('Inflict *Burning* [icon:burning] on target');
    expect(result).not.toContain('[icon:');
    expect(result).not.toContain('  '); // no double spaces
  });

  it('strips unknown icon and collapses surrounding spaces', () => {
    const result = highlight('a [icon:unknown] b');
    expect(result).not.toContain('[icon:');
    expect(result).toMatch(/a\s+b|a b/);
  });
});
