// Ensure PDF.js worker is configured.
// IMPORTANT: You need to have the pdf.worker.js file (or a similar build)
// available at this path relative to your HTML file or an absolute path.
// If you downloaded PDF.js, it's usually in the `build` or `web` directory.
// For this example, we'll assume `pdf.worker.js` is in the same directory as `main.js`.
// If your `main.js` (the one from `pdfjsLib.GlobalWorkerOptions.workerSrc = 'main.js';`)
// was intended to be the worker itself, you might need to adjust this path
// or ensure the worker file is correctly named and placed.
// A common practice is to point to the worker file directly:
// Or if you have it locally:
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';


document.addEventListener('DOMContentLoaded', () => {
  // List of lessons and quizzes in order
  const lessons = [
    { title: "Lesson 1: Use Hand Tools", pdf: "lesson1.pdf" },
    { 
      title: "Lesson 2: Perform Mensuration and Calculations", 
      pdf: "lesson2.pdf", 
      quiz: { 
        title: "Quiz: After Lesson 2", 
        form: "https://forms.gle/TaT2C6rXDv5MfeUPA" // Quiz for 1 & 2
      } 
    },
    { title: "Lesson 3: Interpret Plans and Drawings", pdf: "lesson3.pdf" },
    { title: "Lesson 4: Perform Shop Maintenance", pdf: "lesson4.pdf" },
    { 
      title: "Lesson 5: Practice Occupational Health and Safety Procedures", 
      pdf: "lesson5.pdf", 
      quiz: { 
        title: "Quiz: After Lesson 5", 
        form: "https://forms.gle/n7A3dtKis6Uh4DR69" // Quiz for 3, 4 & 5
      } 
    }
  ];

  const pdfViewer = document.getElementById('pdfViewer');
  const courseOutline = document.getElementById('courseOutline');
  const backToOutlineBtn = document.getElementById('backToOutlineBtn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const prevLabel = prevBtn.querySelector('.nav-label');
  const nextLabel = nextBtn.querySelector('.nav-label');
  const takeQuizBtn = document.querySelector('.take-quiz-btn');
  const formViewer = document.getElementById('form-viewer');
  const pdfCanvas = document.getElementById('pdf-canvas');
  const pdfControlsTop = document.getElementById('pdf-controls-top');
  const pdfControlsBottom = document.getElementById('pdf-controls-bottom');
  const pdfStatusMessage = document.getElementById('pdf-status-message');
  const belowBackBtnDiv = document.getElementById('below-pdf-back-btn');
  const belowBackToOutlineBtn = document.getElementById('belowBackToOutlineBtn');
  const belowPrevBtn = document.getElementById('belowPrevBtn');
  const belowPrevLabel = document.getElementById('belowPrevLabel');
  const belowNextBtn = document.getElementById('belowNextBtn');
  const belowNextLabel = document.getElementById('belowNextLabel');

  let currentIndex = null;
  let showingQuiz = false;

  // Helper to load a lesson by index
  function showLesson(index) {
    currentIndex = index;
    showingQuiz = false;
    pdfViewer.style.display = 'block';
    belowBackBtnDiv.style.display = 'block';
    courseOutline.style.display = 'none';
    formViewer.style.display = 'none';
    pdfCanvas.style.display = 'block';
    if (pdfControlsTop) pdfControlsTop.style.display = 'flex';
    if (pdfControlsBottom) pdfControlsBottom.style.display = 'flex';
    pdfStatusMessage.style.display = 'block';

    // Load the PDF
    loadPdf(lessons[index].pdf);
    updateNavButtons();
    updateBelowNavButtons(); // <-- Add this
  }

  function showQuiz(index) {
    currentIndex = index;
    showingQuiz = true;
    pdfViewer.style.display = 'block';
    belowBackBtnDiv.style.display = 'block';
    courseOutline.style.display = 'none';
    pdfCanvas.style.display = 'none';
    if (pdfControlsTop) pdfControlsTop.style.display = 'none';
    if (pdfControlsBottom) pdfControlsBottom.style.display = 'none';
    pdfStatusMessage.style.display = 'none';
    formViewer.src = lessons[index].quiz.form;
    formViewer.style.display = 'block';
    updateNavButtons();
    updateBelowNavButtons(); // <-- Add this
  }

  function updateNavButtons() {
    // Hide all by default
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    // LESSON VIEW
    if (!showingQuiz) {
      // Previous: show quiz if previous lesson has a quiz
      if (currentIndex > 0 && lessons[currentIndex - 1].quiz) {
        prevBtn.style.display = 'flex';
        prevLabel.textContent = '← Quiz';
        prevBtn.onclick = () => showQuiz(currentIndex - 1);
      }
      // Previous: show lesson if previous is a lesson
      else if (currentIndex > 0) {
        prevBtn.style.display = 'flex';
        prevLabel.textContent = '← ' + lessons[currentIndex - 1].title;
        prevBtn.onclick = () => showLesson(currentIndex - 1);
      }

      // Next: show lesson if next is a lesson
      if (currentIndex < lessons.length - 1 && !lessons[currentIndex + 1].quiz) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = lessons[currentIndex + 1].title + ' →';
        nextBtn.onclick = () => showLesson(currentIndex + 1);
      }
      // Next: show quiz if next is a quiz
      else if (currentIndex < lessons.length - 1 && lessons[currentIndex + 1].quiz) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = 'Take the Quiz →';
        nextBtn.onclick = () => showQuiz(currentIndex);
      }
    }
    // QUIZ VIEW
    else {
      // Previous: show lesson before this quiz
      prevBtn.style.display = 'flex';
      prevLabel.textContent = '← ' + lessons[currentIndex].title;
      prevBtn.onclick = () => showLesson(currentIndex);

      // Next: show next lesson if exists
      if (currentIndex < lessons.length - 1) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = lessons[currentIndex + 1].title + ' →';
        nextBtn.onclick = () => showLesson(currentIndex + 1);
      }
    }
  }

  // Call this whenever you show a lesson or quiz
  function updateBelowNavButtons() {
    // Hide by default
    belowPrevBtn.style.display = 'none';
    belowNextBtn.style.display = 'none';

    // LESSON VIEW
    if (!showingQuiz) {
      if (currentIndex === 0) {
        // Lesson 1: blank / Back / Lesson 2
        belowPrevBtn.style.display = 'none';
        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[1].title + ' →';
        belowNextBtn.onclick = () => showLesson(1);
      }
      else if (currentIndex === 1) {
        // Lesson 2: Lesson 1 / Back / Take the Quiz
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[0].title;
        belowPrevBtn.onclick = () => showLesson(0);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = 'Take the Quiz →';
        belowNextBtn.onclick = () => showQuiz(1);
      }
      else if (currentIndex === 2) {
        // Lesson 3: Review / Back / Lesson 4
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← Review';
        belowPrevBtn.onclick = () => showQuiz(1);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[3].title + ' →';
        belowNextBtn.onclick = () => showLesson(3);
      }
      else if (currentIndex === 3) {
        // Lesson 4: Review / Back / Lesson 5
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← Review';
        belowPrevBtn.onclick = () => showQuiz(1);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[4].title + ' →';
        belowNextBtn.onclick = () => showLesson(4);
      }
      else if (currentIndex === 4) {
        // Lesson 5: Review / Back / Take the Quiz
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← Review';
        belowPrevBtn.onclick = () => showQuiz(4);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = 'Take the Quiz →';
        belowNextBtn.onclick = () => showQuiz(4);
      }
    }
    // QUIZ VIEW
    else {
      // For quiz after lesson 2
      if (currentIndex === 1) {
        // Quiz after lesson 2: Lesson 2 / Back / Lesson 3
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[1].title;
        belowPrevBtn.onclick = () => showLesson(1);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[2].title + ' →';
        belowNextBtn.onclick = () => showLesson(2);
      }
      // For quiz after lesson 5
      else if (currentIndex === 4) {
        // Quiz after lesson 5: Lesson 5 / Back / <blank>
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[4].title;
        belowPrevBtn.onclick = () => showLesson(4);

        belowNextBtn.style.display = 'none';
      }
    }
  }

  // Click on lesson in course outline
  document.querySelectorAll('.lesson-item').forEach((item, idx) => {
    item.addEventListener('click', () => showLesson(idx));
  });

  // Click on quiz in course outline
  document.querySelectorAll('.test-item').forEach((item, idx) => {
    const quizBtn = item.querySelector('.take-test-btn');
    if (quizBtn) {
      quizBtn.addEventListener('click', () => {
        // For "Quiz: Lesson 1 & 2", open the quiz for Lesson 2 (index 1)
        if (idx === 0) {
          showQuiz(1); // Lesson 2's quiz (Quiz for 1 & 2)
        }
        // For "Quiz: Lesson 3, 4 & 5", open the quiz for Lesson 5 (index 4)
        else if (idx === 1) {
          showQuiz(4); // Lesson 5's quiz (Quiz for 3, 4 & 5)
        }
      });
    }
  });

  // Back to Course Outline button
  belowBackToOutlineBtn.addEventListener('click', function() {
    pdfViewer.style.display = 'none';
    belowBackBtnDiv.style.display = 'none';
    courseOutline.style.display = 'block';
    formViewer.style.display = 'none';
  });

  function loadPdf(pdfUrl) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
      // Always render the first page
      pdf.getPage(1).then(function(page) {
        const viewport = page.getViewport({ scale: 1.2 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        page.render(renderContext);
      });
    }).catch(function(error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px Arial";
      ctx.fillStyle = "red";
      ctx.fillText("Failed to load PDF: " + error.message, 10, 50);
    });
  }

  // Initial setup: you may want to hide the PDF viewer on load
  pdfViewer.style.display = 'none';
  formViewer.style.display = 'none';
});
