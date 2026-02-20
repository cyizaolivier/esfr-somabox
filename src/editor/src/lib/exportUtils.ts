import type { EditorElement } from '../state/types';

export const generateStandaloneHtml = (elements: EditorElement[]) => {
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    const elementsHtml = sortedElements.map(el => {
        const style = `
            position: absolute; 
            left: ${el.position.x}px; 
            top: ${el.position.y}px; 
            width: ${el.style.width || 'auto'}; 
            height: ${el.style.height || 'auto'}; 
            z-index: ${el.zIndex};
            ${Object.entries(el.style || {})
                .filter(([k]) => k !== 'width' && k !== 'height' && k !== 'position')
                .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
                .join(';')}
        `;

        let content = '';
        switch (el.type) {
            case 'text':
                content = `<div>${el.content || ''}</div>`;
                break;
            case 'hero':
                const [title, sub] = (el.content || '').split('\n');
                content = `<div style="text-align: center">
                    <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem">${title || ''}</h1>
                    <p style="font-size: 1.25rem; color: #6b7280">${sub || ''}</p>
                </div>`;
                break;
            case 'image':
                content = `<img src="${el.content}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" />`;
                break;
            case 'video':
                content = `
                    <div class="video-container" data-id="${el.id}" data-markers='${JSON.stringify(el.metadata?.markers || [])}'>
                        <video src="${el.content}" style="width: 100%; height: 100%; border-radius: 8px;" controls></video>
                    </div>
                `;
                break;
            case 'quiz': {
                const quizData = el.metadata?.questions?.map((q: any) => ({
                    ...q,
                    correct: btoa(q.correct.toString()) // Security: Base64 encode the answer key
                })) || [];
                content = `
                    <div class="quiz-block" data-id="${el.id}" data-questions='${JSON.stringify(quizData)}' style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <h3 style="font-weight: bold; color: #2563eb; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>Quiz Block</span>
                        </h3>
                        <div class="questions-container"></div>
                    </div>
                `;
                break;
            }
            case 'flashcard':
                content = `
                    <div class="flashcard" onclick="this.classList.toggle('flipped')" style="width: 100%; height: 100%; perspective: 1000px; cursor: pointer;">
                        <div class="flashcard-inner" style="position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d;">
                            <div class="flashcard-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: linear-gradient(to bottom right, #3b82f6, #4f46e5); color: white; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center;">
                                <h3 style="font-weight: bold; font-size: 1.25rem;">${el.metadata?.front || 'Front'}</h3>
                                <p style="font-size: 0.75rem; margin-top: 1rem; opacity: 0.7; text-transform: uppercase;">Click to Flip</p>
                            </div>
                            <div class="flashcard-back" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: white; border: 2px solid #3b82f6; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center; transform: rotateY(180deg);">
                                <p style="color: #3b82f6; font-size: 1.125rem; font-weight: 500;">${el.metadata?.back || 'Back'}</p>
                                <p style="font-size: 0.75rem; margin-top: 1rem; color: #9ca3af; text-transform: uppercase;">Click to Reset</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'resource':
                content = `
                    <a href="${el.metadata?.url || '#'}" download="${el.metadata?.fileName || 'file.pdf'}" style="text-decoration: none; display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <div style="width: 3rem; height: 3rem; background: #fef2f2; color: #ef4444; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            📄
                        </div>
                        <div style="text-align: left; flex: 1">
                            <p style="font-size: 0.875rem; font-weight: 800; color: #1f2937; margin: 0;">${el.metadata?.label || 'Download Resource'}</p>
                            <p style="font-size: 0.625rem; color: #9ca3af; margin: 0; font-family: monospace;">${el.metadata?.fileName || 'file.pdf'}</p>
                        </div>
                    </a>
                `;
                break;
            case 'comment':
                content = `
                    <div class="comment-section" data-id="${el.id}" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 1rem; padding: 1rem; display: flex; flex-direction: column; height: 100%;">
                        <div style="font-size: 0.75rem; font-weight: 800; color: #92400e; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${el.metadata?.title || 'Comments'}
                        </div>
                        <div class="comment-list" style="flex: 1; overflow-y: auto; margin-bottom: 1rem; max-height: 200px;"></div>
                        <div style="display: flex; gap: 0.5rem; background: white; padding: 0.25rem; border-radius: 0.75rem; border: 1px solid #fde68a;">
                            <input type="text" placeholder="Add a comment..." style="flex: 1; border: none; padding: 0.5rem; font-size: 0.875rem; outline: none; border-radius: 0.5rem;">
                            <button style="background: #f59e0b; color: white; border: none; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>
                `;
                break;
            case 'list':
                const items = (el.content || '').split(',').filter(i => i.trim());
                content = `
                    <ul style="list-style-type: disc; list-style-position: inside; padding: 0.5rem;">
                        ${items.map((i: string) => `<li style="margin-bottom: 0.5rem; color: #374151;">${i.trim()}</li>`).join('')}
                    </ul>
                `;
                break;
            default:
                content = `<div style="padding: 1rem; background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; font-style: italic; color: #9ca3af; font-size: 0.75rem;">${el.type} component</div>`;
        }

        return `<div style="${style}" class="canvas-element">${content}</div>`;
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Course</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: #f1f5f9;
            display: flex;
            justify-content: center;
        }
        #canvas {
            width: 100%;
            max-width: 900px;
            min-height: 100vh;
            background-color: white;
            position: relative;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            overflow: hidden;
            margin: 0;
        }
        .canvas-element {
            box-sizing: border-box;
        }
        .flashcard.flipped .flashcard-inner {
            transform: rotateY(180deg);
        }
        .quiz-option {
            padding: 1rem;
            margin-bottom: 0.75rem;
            border: 2px solid #f1f5f9;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: white;
        }
        .quiz-option:hover {
            border-color: #e2e8f0;
            background: #f8fafc;
        }
        .quiz-option.selected {
            border-color: #3b82f6;
            background: #eff6ff;
            font-weight: 600;
        }
        .opt-indicator {
            width: 1.25rem;
            height: 1.25rem;
            border: 2px solid #cbd5e1;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .quiz-option.selected .opt-indicator {
            border-color: #3b82f6;
            background: #3b82f6;
            box-shadow: inset 0 0 0 3px white;
        }
        .quiz-option.correct {
            border-color: #22c55e;
            background: #f0fdf4;
            color: #166534;
        }
        .quiz-option.incorrect {
            border-color: #ef4444;
            background: #fef2f2;
            color: #991b1b;
        }
        .submit-quiz-btn {
            width: 100%;
            padding: 1rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
        }
        .submit-quiz-btn:hover:not(:disabled) {
            background: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }
        .comment-item {
            background: rgba(255,255,255,0.8);
            padding: 0.75rem;
            border-radius: 0.75rem;
            margin-bottom: 0.5rem;
            border: 1px solid #fef3c7;
        }
        #quiz-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        }
        .overlay-content {
            background: white;
            padding: 2.5rem;
            border-radius: 1.5rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
        }
    </style>
</head>
<body>
    <div id="canvas">
        ${elementsHtml}
    </div>

    <div id="quiz-overlay">
        <div class="overlay-content">
            <h2 id="overlay-title" style="margin-bottom: 1rem; font-weight: 800;">Knowledge Check</h2>
            <div id="overlay-quiz-container"></div>
            <button onclick="closeOverlay()" style="margin-top: 1.5rem; background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; cursor: pointer; font-weight: bold; width: 100%">Continue Learning</button>
        </div>
    </div>

    <script>
        // Quiz Runtime
        function initQuizzes() {
            document.querySelectorAll('.quiz-block').forEach(block => {
                const questions = JSON.parse(block.dataset.questions);
                const container = block.querySelector('.questions-container');
                const blockId = block.dataset.id;
                
                questions.forEach((q, qIdx) => {
                    const qEl = document.createElement('div');
                    qEl.className = 'quiz-question-wrap';
                    qEl.style.marginBottom = '2rem';
                    qEl.style.padding = '1rem';
                    qEl.style.borderRadius = '12px';
                    qEl.style.background = '#f8fafc';
                    qEl.innerHTML = '<p style="font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">' + (qIdx + 1) + '. ' + q.question + '</p>';
                    
                    const optionsEl = document.createElement('div');
                    optionsEl.className = 'options-list';
                    q.options.forEach((opt, oIdx) => {
                        const optEl = document.createElement('div');
                        optEl.className = 'quiz-option';
                        optEl.dataset.oidx = oIdx;
                        optEl.innerHTML = '<div class="opt-indicator"></div><span>' + opt + '</span>';
                        optEl.onclick = () => {
                            Array.from(optionsEl.children).forEach(child => child.classList.remove('selected'));
                            optEl.classList.add('selected');
                        };
                        optionsEl.appendChild(optEl);
                    });
                    qEl.appendChild(optionsEl);
                    container.appendChild(qEl);
                });

                // Add Submit Button
                const submitBtn = document.createElement('button');
                submitBtn.className = 'submit-quiz-btn';
                submitBtn.textContent = 'Submit Your Answers';
                submitBtn.onclick = () => {
                    let score = 0;
                    const questionWraps = container.querySelectorAll('.quiz-question-wrap');
                    
                    questionWraps.forEach((wrap, qIdx) => {
                        const selected = wrap.querySelector('.quiz-option.selected');
                        const correctIdx = parseInt(atob(questions[qIdx].correct)); // Security: Decode the answer key
                        
                        const options = wrap.querySelectorAll('.quiz-option');
                        options.forEach((opt, oIdx) => {
                            opt.style.pointerEvents = 'none';
                            if (oIdx === correctIdx) {
                                opt.classList.add('correct');
                                opt.innerHTML += ' <span style="margin-left: auto">✓</span>';
                            } else if (opt.classList.contains('selected')) {
                                opt.classList.add('incorrect');
                                opt.innerHTML += ' <span style="margin-left: auto">✗</span>';
                            }
                        });
                        
                        if (selected && parseInt(selected.dataset.oidx) === correctIdx) {
                            score++;
                        }
                    });

                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    submitBtn.textContent = 'Score: ' + score + '/' + questions.length;
                    
                    const feedback = document.createElement('div');
                    feedback.style.marginTop = '1rem';
                    feedback.style.fontSize = '0.875rem';
                    feedback.style.fontWeight = 'bold';
                    feedback.style.textAlign = 'center';
                    feedback.style.color = score === questions.length ? '#166534' : '#991b1b';
                    feedback.textContent = score === questions.length ? 'Perfect Score! Well done.' : 'Review your answers above to see corrections.';
                    block.appendChild(feedback);
                };
                block.appendChild(submitBtn);
            });
        }

        // Comment Runtime
        function initComments() {
            document.querySelectorAll('.comment-section').forEach(section => {
                const blockId = section.dataset.id;
                const list = section.querySelector('.comment-list');
                const input = section.querySelector('input');
                const btn = section.querySelector('button');

                const loadComments = () => {
                    const stored = localStorage.getItem('comments_' + blockId);
                    const comments = stored ? JSON.parse(stored) : [];
                    list.innerHTML = '';
                    if (comments.length === 0) {
                        list.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem; font-style: italic; font-size: 0.875rem">No comments yet.</div>';
                    }
                    comments.forEach(c => {
                        const cEl = document.createElement('div');
                        cEl.className = 'comment-item';
                        cEl.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem"><span style="font-weight: 700; color: #334155; font-size: 0.75rem">' + c.user + '</span><span style="font-size: 0.625rem; color: #94a3b8">' + c.date + '</span></div><p style="margin: 0; font-size: 0.875rem; color: #475569">' + c.text + '</p>';
                        list.appendChild(cEl);
                    });
                    list.scrollTop = list.scrollHeight;
                };

                btn.onclick = () => {
                    const text = input.value.trim();
                    if (!text) return;
                    const stored = localStorage.getItem('comments_' + blockId);
                    const comments = stored ? JSON.parse(stored) : [];
                    comments.push({
                        id: Date.now().toString(),
                        user: 'Student',
                        text: text,
                        date: new Date().toLocaleDateString()
                    });
                    localStorage.setItem('comments_' + blockId, JSON.stringify(comments));
                    input.value = '';
                    loadComments();
                };

                input.onkeydown = (e) => e.key === 'Enter' && btn.onclick();
                loadComments();
            });
        }

        // Video Runtime (Markers)
        let activeVideo = null;
        function initVideos() {
            document.querySelectorAll('.video-container').forEach(container => {
                const video = container.querySelector('video');
                const markers = JSON.parse(container.dataset.markers);
                let triggered = new Set();

                video.ontimeupdate = () => {
                    const current = Math.floor(video.currentTime);
                    markers.forEach(m => {
                        if (current === m.time && !triggered.has(m.time)) {
                            triggered.add(m.time);
                            video.pause();
                            activeVideo = video;
                            showOverlay(m);
                        }
                    });
                };
            });
        }

        function showOverlay(marker) {
            const overlay = document.getElementById('quiz-overlay');
            const container = document.getElementById('overlay-quiz-container');
            overlay.style.display = 'flex';
            container.innerHTML = '<p style="color: #4b5563">Time for a quick knowledge check based on the video!</p><div style="margin-top: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f9fafb;">' + marker.label + ' triggered.</div>';
        }

        function closeOverlay() {
            document.getElementById('quiz-overlay').style.display = 'none';
            if (activeVideo) activeVideo.play();
        }

        window.onload = () => {
            initQuizzes();
            initVideos();
            initComments();
        };
    </script>
</body>
</html>
    `;
};
