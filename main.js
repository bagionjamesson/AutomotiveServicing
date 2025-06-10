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
    { title: "Lesson 1: Use Hand Tools", shortTitle: "Lesson 1", pdf: "lesson1.pdf" },
    { 
      title: "Lesson 2: Perform Mensuration and Calculations", 
      shortTitle: "Lesson 2",
      pdf: "lesson2.pdf", 
      quiz: { 
        title: "Quiz: After Lesson 2", 
        form: "https://forms.gle/dfDqbScq2oprYDaZ9" // Quiz for 1 & 2
      } 
    },
    { title: "Lesson 3: Interpret Plans and Drawings", shortTitle: "Lesson 3", pdf: "lesson3.pdf" },
    { title: "Lesson 4: Perform Shop Maintenance", shortTitle: "Lesson 4", pdf: "lesson4.pdf" },
    { 
      title: "Lesson 5: Practice Occupational Health and Safety Procedures", 
      shortTitle: "Lesson 5",
      pdf: "lesson5.pdf", 
      quiz: { 
        title: "Quiz: After Lesson 5", 
        form: "https://forms.gle/VuxRyQ94GyabbTCa6" // Quiz for 3, 4 & 5
        
      } 
    },
    { 
      title: "Course Evaluation", 
      shortTitle: "Course Evaluation", 
      quiz: { 
        title: "Course Evaluation", 
        form: "https://forms.gle/J1GYecjTdYnjpAzf9" // Course evaluation form
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
  const belowNextBtn = document.getElementById('belowNextBtn');
  const belowPrevLabel = document.getElementById('belowPrevLabel');
  const belowNextLabel = document.getElementById('belowNextLabel');

  let currentIndex = null;
  let showingQuiz = false;
  let pdfDoc = null;
  let pageNum = 1;
  let totalPages = 1;

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

    // Hide the evaluation button when switching lessons
    const evalBtn = document.getElementById('courseEvalBtn');
    if (evalBtn) evalBtn.style.display = 'none' ; // Corrected: 'none' to hide, based on comment

    // Load the PDF
    loadPdf(lessons[index].pdf);
    updateNavButtons();
    updateBelowNavButtons();
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
        prevLabel.textContent = '← ' + lessons[currentIndex - 1].shortTitle;
        prevBtn.onclick = () => showLesson(currentIndex - 1);
      }

      // Next: show lesson if next is a lesson
      if (currentIndex < lessons.length - 1 && !lessons[currentIndex + 1].quiz) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = lessons[currentIndex + 1].shortTitle + ' →';
        nextBtn.onclick = () => showLesson(currentIndex + 1);
      }
      // Next: show quiz if next is a quiz
      else if (currentIndex < lessons.length - 1 && lessons[currentIndex + 1].quiz) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = 'Take the Quiz 1 →';
        nextBtn.onclick = () => showQuiz(currentIndex);
      }
      //
    }
    // QUIZ VIEW
    else {
      // Previous: show lesson before this quiz
      prevBtn.style.display = 'flex';
      prevLabel.textContent = '← ' + lessons[currentIndex].shortTitle;
      prevBtn.onclick = () => showLesson(currentIndex);

      // Next: show next lesson if exists
      if (currentIndex < lessons.length - 1) {
        nextBtn.style.display = 'flex';
        nextLabel.textContent = lessons[currentIndex + 1].shortTitle + ' →';
        nextBtn.onclick = () => showLesson(currentIndex + 1);
      }
    }
  }

  // Call this whenever you show a lesson or quiz
  function updateBelowNavButtons() {
    // Hide by default
    // Hide all individual nav buttons by default and reset evalBtn
    belowPrevBtn.style.display = 'none';
    belowNextBtn.style.display = 'none';
    // Reset margins that might be applied in specific cases
    belowPrevBtn.style.marginRight = '';
    belowBackToOutlineBtn.style.marginRight = ''; // For the middle "Back" button

    const existingEvalBtn = document.getElementById('courseEvalBtn');
    if (existingEvalBtn) {
        existingEvalBtn.style.display = 'none'; // Hide by default, will be shown if needed
    }

    // LESSON VIEW
    if (!showingQuiz) {
      if (currentIndex === 0) {
        // Lesson 1: blank / Back / Lesson 2
        belowPrevBtn.style.display = 'none';
        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[1].shortTitle + ' →';
        belowNextBtn.onclick = () => showLesson(1);
      }
      else if (currentIndex === 1) {
        // Lesson 2: Lesson 1 / Back / Take the Quiz
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[0].shortTitle;
        belowPrevBtn.onclick = () => showLesson(0);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = 'Take the Quiz 1→';
        belowNextBtn.onclick = () => showQuiz(1);
      }
      else if (currentIndex === 2) {
        // Lesson 3: Review / Back / Lesson 4
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← Review';
        belowPrevBtn.onclick = () => showQuiz(1);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[3].shortTitle + ' →';
        belowNextBtn.onclick = () => showLesson(3);
      }
      else if (currentIndex === 3) {
        // Lesson 4: ← Lesson 3, Back to Course Outline, Lesson 5 →
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[2].shortTitle;
        belowPrevBtn.onclick = () => showLesson(2);

        belowBackToOutlineBtn.style.display = 'inline-block';

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[4].shortTitle + ' →';
        belowNextBtn.onclick = () => showLesson(4);
      }
      else if (currentIndex === 4) {
        // Lesson 5: ← Lesson 4, Take the Quiz: After Lesson 5 →, Back
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[3].shortTitle;
        belowPrevBtn.onclick = () => showLesson(3);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = 'Quiz 2 →';
        belowNextBtn.onclick = () => showQuiz(4);

        belowBackToOutlineBtn.style.display = 'inline-block';

        // Hide the separate evaluation button if it exists
        const evalBtn = document.getElementById('courseEvalBtn');
        if (evalBtn) evalBtn.style.display = 'inline-block'; // Corrected: Assuming '20px' meant to show
      } else {
        // ...existing code for other lessons...
        belowBackToOutlineBtn.style.display = 'inline-block';
        const evalBtn = document.getElementById('courseEvalBtn');
        if (evalBtn) evalBtn.style.display = 'inline-block'; // Corrected: Assuming '20px' meant to show
      }
    }
    // QUIZ VIEW
    else {
      // For quiz after lesson 2 (lessons[1].quiz, so currentIndex is 1)
      if (currentIndex === 1) {
        // Quiz after lesson 2: Lesson 2 / Back / Lesson 3
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[1].shortTitle;
        belowPrevBtn.onclick = () => showLesson(1);

        belowNextBtn.style.display = 'inline-block';
        belowNextLabel.textContent = lessons[2].shortTitle + ' →';
        belowNextBtn.onclick = () => showLesson(2);
      }
      // For quiz after lesson 5 (lessons[4].quiz, so currentIndex is 4)
      else if (currentIndex === 4) { // This implies showingQuiz is true due to the outer else
        // Quiz: After Lesson 5: Displaying ← Lesson 5 and Back (to outline)
        // "Previous" button goes to Lesson 5 content
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[4].shortTitle;
        belowPrevBtn.onclick = () => showLesson(4);

        belowBackToOutlineBtn.style.display = 'inline-block'; // This is the "Back" (to outline) button
        belowBackToOutlineBtn.textContent = 'Back';

        // "Next" button goes to Course Evaluation (lessons[5])
        if (lessons[currentIndex + 1] && lessons[currentIndex + 1].quiz) { // Check if lessons[5] exists and has a quiz/form
            belowNextBtn.style.display = 'inline-block';
            belowNextLabel.textContent = lessons[currentIndex + 1].shortTitle + ' →'; // "Course Evaluation →"
            belowNextBtn.onclick = () => showQuiz(currentIndex + 1); // This will call showQuiz(5)
        } else {
            belowNextBtn.style.display = 'none';
        }
      }
      // For Course Evaluation form (lessons[5].quiz, so currentIndex is 5)
      else if (currentIndex === 5) {
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + lessons[4].quiz.title; // "Quiz: After Lesson 5"
        belowPrevBtn.onclick = () => showQuiz(4); // Show the quiz for Lesson 5

        belowBackToOutlineBtn.style.display = 'inline-block';
        belowBackToOutlineBtn.textContent = 'Back';

        belowNextBtn.style.display = 'none'; // No "Next" after the final evaluation
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

  // Change the label for the Back to Course Outline button to just "Back"
  belowBackToOutlineBtn.textContent = 'Back';

  // Update your loadPdf function:
  function loadPdf(pdfUrl) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
      pdfDoc = pdf;
      pageNum = 1;
      totalPages = pdf.numPages;
      renderPage(pageNum);
    }).catch(function(error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px Arial";
      ctx.fillStyle = "red";
      ctx.fillText("Failed to load PDF: " + error.message, 10, 50);
    });
  }

  // Render a specific page
  function renderPage(num) {
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    pdfDoc.getPage(num).then(function(page) {
      const viewport = page.getViewport({ scale: 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      page.render(renderContext);

      // Update page numbers if you have them
      const pageNumTop = document.getElementById('page-num-top');
      const pageCountTop = document.getElementById('page-count-top');
      const pageNumBottom = document.getElementById('page-num-bottom');
      const pageCountBottom = document.getElementById('page-count-bottom');
      if (pageNumTop) pageNumTop.textContent = num;
      if (pageCountTop) pageCountTop.textContent = totalPages;
      if (pageNumBottom) pageNumBottom.textContent = num;
      if (pageCountBottom) pageCountBottom.textContent = totalPages;
    });
  }

  // Navigation handlers
  function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
  }
  function onNextPage() {
    if (pageNum >= totalPages) return;
    pageNum++;
    renderPage(pageNum);
  }

  // Attach event listeners (make sure these IDs exist in your HTML)
  document.getElementById('prev-page-top')?.addEventListener('click', onPrevPage);
  document.getElementById('next-page-top')?.addEventListener('click', onNextPage);
  document.getElementById('prev-page-bottom')?.addEventListener('click', onPrevPage);
  document.getElementById('next-page-bottom')?.addEventListener('click', onNextPage);

  // Initial setup: you may want to hide the PDF viewer on load
  pdfViewer.style.display = 'none';
  formViewer.style.display = 'none';

  // Place this inside your DOMContentLoaded event
  const goToCourseEvalBtn = document.getElementById('goToCourseEvalBtn');
  if (goToCourseEvalBtn) {
    goToCourseEvalBtn.addEventListener('click', function() {
      // Hide course outline, show PDF viewer, hide PDF canvas, show form
      courseOutline.style.display = 'none';
      pdfViewer.style.display = 'block';
      belowBackBtnDiv.style.display = 'block';
      pdfCanvas.style.display = 'none';
      if (pdfControlsTop) pdfControlsTop.style.display = 'none';
      if (pdfControlsBottom) pdfControlsBottom.style.display = 'none';
      pdfStatusMessage.style.display = 'none';
      formViewer.src = 'https://forms.gle/J1GYecjTdYnjpAzf9'; // Your evaluation form link
      formViewer.style.display = 'block';

      // Set state and update bottom navigation for consistency
      currentIndex = 5; // Assuming "Course Evaluation" is at index 5 in the lessons array
      showingQuiz = true; // Treat form display like a quiz display for nav purposes
      updateBelowNavButtons();
    });
  }
});