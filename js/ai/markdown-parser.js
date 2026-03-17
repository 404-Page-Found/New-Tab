// js/ai/markdown-parser.js - Lightweight Markdown Parser
// Converts markdown text to safe HTML for AI Assistant responses

const MarkdownParser = (function() {
  'use strict';

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Parse inline markdown (bold, italic, code, links)
   * @param {string} text - Text to parse
   * @returns {string} HTML string
   */
  function parseInline(text) {
    // Escape HTML first
    let html = escapeHTML(text);
    
    // Code (inline) - must be done before other inline elements
    html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
    
    // Bold and Italic (***text*** or ___text___)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    
    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Strikethrough (~~text~~)
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
    
    // Images ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image" />');
    
    return html;
  }

  /**
   * Parse code blocks
   * @param {string} text - Text containing code blocks
   * @returns {string} HTML string
   */
  function parseCodeBlocks(text) {
    // Fenced code blocks with language
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? `<span class="md-code-lang">${escapeHTML(lang)}</span>` : '';
      return `<div class="md-code-block">${language}<pre><code>${escapeHTML(code.trim())}</code></pre></div>`;
    });
    
    // Fenced code blocks without language
    text = text.replace(/```\n?([\s\S]*?)```/g, (match, code) => {
      return `<div class="md-code-block"><pre><code>${escapeHTML(code.trim())}</code></pre></div>`;
    });
    
    return text;
  }

  /**
   * Parse blockquotes
   * @param {string} text - Text containing blockquotes
   * @returns {string} HTML string
   */
  function parseBlockquotes(text) {
    const lines = text.split('\n');
    let inBlockquote = false;
    let blockquoteContent = [];
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const blockquoteMatch = line.match(/^>\s?(.*)/);

      if (blockquoteMatch) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = [];
        }
        blockquoteContent.push(blockquoteMatch[1]);
      } else {
        if (inBlockquote) {
          result.push(`<blockquote class="md-blockquote">${parseInline(blockquoteContent.join('\n'))}</blockquote>`);
          inBlockquote = false;
          blockquoteContent = [];
        }
        result.push(line);
      }
    }

    if (inBlockquote) {
      result.push(`<blockquote class="md-blockquote">${parseInline(blockquoteContent.join('\n'))}</blockquote>`);
    }

    return result.join('\n');
  }

  /**
   * Parse lists (ordered and unordered)
   * @param {string} text - Text containing lists
   * @returns {string} HTML string
   */
  function parseLists(text) {
    const lines = text.split('\n');
    let result = [];
    let inList = false;
    let listType = null;
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const unorderedMatch = line.match(/^[\s]*[-*+]\s+(.*)/);
      const orderedMatch = line.match(/^[\s]*\d+\.\s+(.*)/);

      if (unorderedMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) {
            result.push(buildList(listType, listItems));
          }
          inList = true;
          listType = 'ul';
          listItems = [];
        }
        listItems.push(unorderedMatch[1]);
      } else if (orderedMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) {
            result.push(buildList(listType, listItems));
          }
          inList = true;
          listType = 'ol';
          listItems = [];
        }
        listItems.push(orderedMatch[1]);
      } else {
        if (inList) {
          result.push(buildList(listType, listItems));
          inList = false;
          listType = null;
          listItems = [];
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push(buildList(listType, listItems));
    }

    return result.join('\n');
  }

  /**
   * Build list HTML
   * @param {string} type - 'ul' or 'ol'
   * @param {Array} items - List items
   * @returns {string} HTML string
   */
  function buildList(type, items) {
    const itemsHtml = items.map(item => `<li class="md-list-item">${parseInline(item)}</li>`).join('');
    return `<${type} class="md-list md-list-${type}">${itemsHtml}</${type}>`;
  }

  /**
   * Parse tables
   * @param {string} text - Text containing tables
   * @returns {string} HTML string
   */
  function parseTables(text) {
    const lines = text.split('\n');
    let result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const nextLine = lines[i + 1];

      // Check if this is a table (has | and next line has |---|)
      if (line.includes('|') && nextLine && /^\|?[\s-:|]+\|?$/.test(nextLine)) {
        const headerCells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        const rows = [];
        i += 2; // Skip header and separator

        while (i < lines.length && lines[i].includes('|')) {
          const cells = lines[i].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
          rows.push(cells);
          i++;
        }

        const headerHtml = headerCells.map(cell => `<th class="md-table-header">${parseInline(cell)}</th>`).join('');
        const rowsHtml = rows.map(row => {
          const cellsHtml = row.map(cell => `<td class="md-table-cell">${parseInline(cell)}</td>`).join('');
          return `<tr class="md-table-row">${cellsHtml}</tr>`;
        }).join('');

        result.push(`<div class="md-table-wrapper"><table class="md-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`);
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join('\n');
  }

  /**
   * Parse headers
   * @param {string} text - Text containing headers
   * @returns {string} HTML string
   */
  function parseHeaders(text) {
    const lines = text.split('\n');
    return lines.map(line => {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        return `<h${level} class="md-header md-header-${level}">${parseInline(content)}</h${level}>`;
      }
      return line;
    }).join('\n');
  }

  /**
   * Parse horizontal rules
   * @param {string} text - Text containing horizontal rules
   * @returns {string} HTML string
   */
  function parseHorizontalRules(text) {
    return text.replace(/^[-*_]{3,}$/gm, '<hr class="md-hr" />');
  }

  /**
   * Parse paragraphs
   * @param {string} text - Text to parse into paragraphs
   * @returns {string} HTML string
   */
  function parseParagraphs(text) {
    const blocks = text.split(/\n\n+/);
    return blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      
      // Don't wrap if already wrapped in block elements
      if (block.startsWith('<h') || 
          block.startsWith('<ul') || 
          block.startsWith('<ol') || 
          block.startsWith('<blockquote') || 
          block.startsWith('<pre') || 
          block.startsWith('<div') ||
          block.startsWith('<hr') ||
          block.startsWith('<table')) {
        return block;
      }
      
      // Handle single line breaks within paragraphs
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length === 1) {
        return `<p class="md-paragraph">${parseInline(lines[0])}</p>`;
      }
      
      return `<p class="md-paragraph">${lines.map(line => parseInline(line)).join('<br />')}</p>`;
    }).join('\n\n');
  }

  /**
   * Main parse function
   * @param {string} markdown - Markdown text to parse
   * @returns {string} Safe HTML string
   */
  function parse(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    let html = markdown;

    // Parse in order of precedence
    html = parseCodeBlocks(html);      // Code blocks first to protect content
    html = parseTables(html);          // Tables
    html = parseHeaders(html);         // Headers
    html = parseBlockquotes(html);     // Blockquotes
    html = parseLists(html);           // Lists
    html = parseHorizontalRules(html); // Horizontal rules
    html = parseParagraphs(html);      // Paragraphs last

    return html;
  }

  // Public API
  return {
    parse: parse
  };
})();

// Export to global scope
window.MarkdownParser = MarkdownParser;