import type { EditorState } from '../state/types';
import type { CourseState } from '../state/CourseContext';

export interface ExportOptions {
    title: string;
    includeMetadata?: boolean;
}

const generateStyles = (elements: any[]) => {
    return elements.map((el: any) => {
        const styleString = Object.entries(el.style).map(([key, value]: [string, any]) => {
            const cssKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            return `${cssKey}: ${value}`;
        }).join(';');

        return `#${el.id} { ${styleString}; margin-left: auto; margin-right: auto; }`;
    }).join('\n');
};

const generateBody = (elements: any[]) => {
    return elements.map((el: any) => {
        let content = '';
        switch (el.type) {
            case 'text':
                content = `<p style="margin: 0; line-height: 1.6;">${el.content}</p>`;
                break;
            case 'image':
                content = `<img src="${el.content}" alt="Image" style="width: 100%; height: auto; border-radius: 8px;" />`;
                break;
            case 'hero': {
                const parts = (el.content || '').split('\n');
                content = `<div style="padding: 60px 20px; text-align: center;">
                    <h1 style="font-size: clamp(32px, 8vw, 48px); margin-bottom: 12px; font-weight: 800; line-height: 1.1;">${parts[0] || ''}</h1>
                    <p style="font-size: clamp(18px, 4vw, 20px); color: #666; max-width: 600px; margin: 0 auto;">${parts[1] || ''}</p>
                </div>`;
                break;
            }
            case 'list': {
                const items = (el.content || '').split(',');
                content = `<div style="padding: 10px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${items.map((item: string) => `<li style="display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 16px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 12px; margin-top: 6px; flex-shrink: 0;"></span>
                            <span style="line-height: 1.5;">${item.trim()}</span>
                        </li>`).join('')}
                    </ul>
                </div>`;
                break;
            }
            case 'container':
                content = `<div style="min-height: 50px; border: 1px dashed #eee; border-radius: 4px;"></div>`;
                break;
        }
        return `<div id="${el.id}" class="element-wrapper">${content}</div>`;
    }).join('\n');
};

export const generateHtml = (state: EditorState) => {
    const styles = generateStyles(state.elements);
    const body = generateBody(state.elements);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Topic</title>
    <style>
        body { margin: 0; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; }
        .element-wrapper { margin-bottom: 24px; width: 100%; }
        ${styles}
    </style>
</head>
<body>
    <div class="container">${body}</div>
</body>
</html>`;
};

export const generateCourseExport = (course: CourseState) => {
    const { metadata, topics } = course;

    const topicContents = topics.map((topic) => {
        let elements = [];
        try {
            const parsed = JSON.parse(topic.layoutJSON || '{"elements":[]}');
            elements = parsed.elements || (Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            elements = [];
        }
        return {
            id: topic.id,
            title: topic.title,
            styles: generateStyles(elements),
            body: generateBody(elements)
        };
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title}</title>
    <style>
        :root { --primary: #2563eb; --bg: #f8fafc; --text: #0f172a; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; background: var(--bg); color: var(--text); }
        
        /* Sidebar */
        aside { width: 300px; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .aside-header { padding: 24px; border-bottom: 1px solid #f1f5f9; }
        .aside-header h1 { font-size: 1.25rem; margin: 0; color: var(--text); }
        .aside-header p { font-size: 0.875rem; color: #64748b; margin: 8px 0 0; }
        nav { flex: 1; overflow-y: auto; padding: 12px; }
        .nav-item { display: block; padding: 12px 16px; border-radius: 8px; text-decoration: none; color: #475569; margin-bottom: 4px; transition: all 0.2s; cursor: pointer; font-weight: 500; }
        .nav-item:hover { background: #f1f5f9; color: var(--primary); }
        .nav-item.active { background: #eff6ff; color: var(--primary); }

        /* Content */
        main { flex: 1; overflow-y: auto; padding: 60px 20px; position: relative; scroll-behavior: smooth; }
        .content-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 60px; border-radius: 24px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .topic-section { display: none; }
        .topic-section.active { display: block; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .element-wrapper { margin-bottom: 24px; width: 100%; }
        
        ${topicContents.map(t => t.styles).join('\n')}
    </style>
</head>
<body>
    <aside>
        <div className="aside-header">
            <h1>${metadata.title}</h1>
            <p>${metadata.category} • ${metadata.level.charAt(0).toUpperCase() + metadata.level.slice(1)}</p>
        </div>
        <nav id="topic-nav">
            ${topicContents.map((t, i) => `
                <a class="nav-item ${i === 0 ? 'active' : ''}" onclick="showTopic('${t.id}')">
                    ${i + 1}. ${t.title}
                </a>
            `).join('')}
        </nav>
    </aside>

    <main>
        <div class="content-container">
            ${topicContents.map((t, i) => `
                <section id="section-${t.id}" class="topic-section ${i === 0 ? 'active' : ''}">
                    ${t.body}
                </section>
            `).join('')}
        </div>
    </main>

    <script>
        function showTopic(id) {
            // Update sections
            document.querySelectorAll('.topic-section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-' + id).classList.add('active');
            
            // Update nav
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            event.target.classList.add('active');
            
            // Scroll to top
            document.querySelector('main').scrollTop = 0;
        }
    </script>
</body>
</html>`;
};
