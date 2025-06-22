// Ensure PDF.js worker is configured.
// Using CDN worker for simplicity, ensure this path is correct or use a local copy.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => { // Consolidated DOMContentLoaded
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navLinksList = document.getElementById('nav-links-list'); // Using the ID we added

  if (hamburgerMenu && navLinksList) {
    hamburgerMenu.addEventListener('click', () => {
      // Toggle .active class on nav-links to show/hide menu
      navLinksList.classList.toggle('active');
      
      // Toggle .active class on hamburger for X animation
      hamburgerMenu.classList.toggle('active');

      // Update ARIA attribute for accessibility
      const isExpanded = navLinksList.classList.contains('active');
      hamburgerMenu.setAttribute('aria-expanded', isExpanded.toString());
    });

    // Optional: Close mobile menu when a link is clicked
    // This is useful if your links navigate away or for single-page app-like behavior
    navLinksList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        // Only close if the menu is active and it's a mobile view (hamburger is visible)
        if (navLinksList.classList.contains('active') && getComputedStyle(hamburgerMenu).display !== 'none') {
          navLinksList.classList.remove('active');
          hamburgerMenu.classList.remove('active');
          hamburgerMenu.setAttribute('aria-expanded', 'false');
        }
      });
    });
  } else {
    console.warn('Hamburger menu or navigation links list not found. Check HTML class/ID names.');
  }

  const pdfViewer = document.getElementById('pdfViewer');
  const courseOutline = document.getElementById('courseOutline');
  // const backToOutlineBtn = document.getElementById('backToOutlineBtn'); // This ID is not in HTML, belowBackToOutlineBtn is used.
  // const prevBtn = document.querySelector('.prev-btn'); // Top nav buttons are hidden and logic removed
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
  const introSection = document.querySelector('.intro-section'); // Main course intro
  const showOutlineButton = document.getElementById('showOutlineBtn'); // Button in main intro
  const introTitleElement = document.getElementById('introTitle'); // The H1 in the main intro

  // Unit Introduction specific elements
  const unitIntroductionsContainer = document.getElementById('unit-introductions-container');
  let unitSubtitles = [];
  let startUnitBtns = [];
  let unitIntroBackBtns = [];

  // Collect all navigable items from the DOM in order
  const courseSidebar = document.querySelector('.course-sidebar');
  let allNavigableItems = [];
  if (courseSidebar) {
      // Select all items that can be navigated to
      allNavigableItems = Array.from(courseSidebar.querySelectorAll('.lesson-item, .test-item.test-highlight, .evaluation-slot'));
      
      // Select elements related to unit introductions
      unitSubtitles = Array.from(courseSidebar.querySelectorAll('.unit-subtitle[data-unit-intro-id]'));
      if (unitIntroductionsContainer) { // Ensure container exists before querying within it
        startUnitBtns = Array.from(unitIntroductionsContainer.querySelectorAll('.start-unit-btn[data-target-item-id]'));
        unitIntroBackBtns = Array.from(unitIntroductionsContainer.querySelectorAll('.unit-intro-back-btn'));
      }
  } else {
      console.error("'.course-sidebar' not found. Navigation items cannot be initialized.");
  }

  let currentIndex = null;
  let pdfDoc = null;
  let pageNum = 1;
  let totalPages = 1;
  // Helper to get the title from an item element
  const getItemTitle = (itemElement) => 
      itemElement ? (itemElement.querySelector('.lesson-title, .test-title')?.textContent.trim() || 'Item') : 'Item';

  // Generic function to display content based on item index
  function displayItemContent(index) {
    if (index < 0 || index >= allNavigableItems.length) return;
    currentIndex = index;
    pdfViewer.style.display = 'block';
    belowBackBtnDiv.style.display = 'block';
    if (unitIntroductionsContainer) unitIntroductionsContainer.style.display = 'none'; // Hide unit intros
    courseOutline.style.display = 'none';

    // Initially hide all specific content views and PDF controls
    pdfCanvas.style.display = 'none'; // Hide PDF canvas
    formViewer.style.display = 'none'; // Hide Google Form iframe
    if (pdfControlsTop) pdfControlsTop.style.display = 'none'; // Hide top PDF controls
    if (pdfControlsBottom) pdfControlsBottom.style.display = 'none'; // Hide bottom PDF controls
    if (pdfStatusMessage) pdfStatusMessage.style.display = 'none'; // Hide PDF status message

    const currentItem = allNavigableItems[currentIndex];
    const gformSrc = currentItem.dataset.gformSrc; // Check for Google Form source
    const pdfSrc = currentItem.dataset.pdfSrc;

    if (gformSrc) {
        // It's a Google Form (Pre-Test, Post-Test, Summative, Final Exam)
        formViewer.src = gformSrc;
        formViewer.style.display = 'block'; // Show the iframe

        // PDF-specific elements remain hidden (as per initial hide)
    } else if (pdfSrc) {
        // It's a PDF (Lesson or the evaluation slot)
        pdfCanvas.style.display = 'block';
        if (pdfControlsTop) pdfControlsTop.style.display = 'flex';
        if (pdfControlsBottom) pdfControlsBottom.style.display = 'flex';
        if (pdfStatusMessage) pdfStatusMessage.style.display = 'block';

        // Google Form iframe remains hidden (as per initial hide)
        loadPdf(pdfSrc);
    } else {
        console.warn(`Item at index ${currentIndex} has no content source (gformSrc or pdfSrc):`, currentItem);
        // Fallback: hide viewer, show outline
        pdfViewer.style.display = 'none';
        belowBackBtnDiv.style.display = 'none';
        courseOutline.style.display = 'block';
        // Ensure both content types and their controls are hidden
        formViewer.style.display = 'none';
        pdfCanvas.style.display = 'none';
        if (pdfControlsTop) pdfControlsTop.style.display = 'none';
        if (pdfControlsBottom) pdfControlsBottom.style.display = 'none';
        if (pdfStatusMessage) pdfStatusMessage.style.display = 'none';
    }

    updateBelowNavButtons();
  }

  // Update the navigation buttons below the PDF/Form viewer
  function updateBelowNavButtons() {
    belowPrevBtn.style.display = 'none';
    belowNextBtn.style.display = 'none';

    // Previous Button
    if (currentIndex > 0) {
        const prevItem = allNavigableItems[currentIndex - 1];
        belowPrevBtn.style.display = 'inline-block';
        belowPrevLabel.textContent = '← ' + getItemTitle(prevItem).split(':')[0].trim();
        belowPrevBtn.onclick = () => displayItemContent(currentIndex - 1);
    }

    // Next Button
    if (currentIndex < allNavigableItems.length - 1) {
        const currentItemElement = allNavigableItems[currentIndex];
        const nextItemElement = allNavigableItems[currentIndex + 1];
        let nextActionIsUnitIntro = false;
        let unitIntroIdToShow = null;
        let unitIntroTitle = 'Next Unit Introduction';

        // Check if current item is a Post-Test and next item is a Pre-Test of a new unit
        const currentItemTitleText = getItemTitle(currentItemElement).toLowerCase();
        const currentItemIsPostTest = currentItemTitleText.includes('post-test');
        const nextItemIsPreTest = nextItemElement.id && nextItemElement.id.includes('-pretest-item');

        if (currentItemIsPostTest && nextItemIsPreTest && unitIntroductionsContainer) {
            // Attempt to find the corresponding unit intro for the *next* item (the Pre-Test)
            const unitNumberMatch = nextItemElement.id.match(/^unit(\d+)-pretest-item$/);
            if (unitNumberMatch) {
                const unitNumber = unitNumberMatch[1];
                const potentialIntroId = `unit${unitNumber}-intro`;
                const introDiv = document.getElementById(potentialIntroId);
                if (introDiv) { // Check if the intro div exists
                    nextActionIsUnitIntro = true;
                    unitIntroIdToShow = potentialIntroId;
                    // Set the button text to "Unit X" based on the extracted number
                    unitIntroTitle = `Unit: ${unitNumber}`;
                }
            }
        }

        belowNextBtn.style.display = 'inline-block';
        if (nextActionIsUnitIntro) {
            belowNextLabel.textContent = unitIntroTitle + ' →';
            belowNextBtn.onclick = () => showUnitIntroductionView(unitIntroIdToShow);
        } else {
            // Shorten the default next item title (e.g., "Lesson 2: Explain..." becomes "Lesson 2")
            const shortNextItemTitle = getItemTitle(nextItemElement).split(':')[0].trim();
            belowNextLabel.textContent = shortNextItemTitle + ' →';
            belowNextBtn.onclick = () => displayItemContent(currentIndex + 1);
        }
    }
  }

  // Click on lesson in course outline
  // Click on any navigable item in course outline
  allNavigableItems.forEach((item, idx) => {
    // Determine the clickable element within the item
    const clickableElement = item.querySelector('.take-test-btn, .go-btn') || item;

    clickableElement.addEventListener('click', (event) => {
        // Prevent event from bubbling if a specific button was clicked
        if (clickableElement !== item && clickableElement === event.target) {
            event.stopPropagation();
        }
        displayItemContent(idx);
    });
  });

  // Back to Course Outline button
  belowBackToOutlineBtn.addEventListener('click', function() {
    showCourseOutlineView();
    // `showCourseOutlineView` already handles hiding other views and resetting currentIndex.
  });

  // Change the label for the Back to Course Outline button to just "Back"
  belowBackToOutlineBtn.textContent = 'Back';

  // Update your loadPdf function:
  // This function is called by displayItemContent when a PDF is needed
  function loadPdf(pdfUrl) {
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

  // Initial setup: Hide viewer and outline, show intro
  pdfViewer.style.display = 'none';
  courseOutline.style.display = 'none'; // Hide course outline initially
  if (formViewer) formViewer.style.display = 'none';
  if (unitIntroductionsContainer) unitIntroductionsContainer.style.display = 'none'; // Also hide unit intros initially
  if (introSection) introSection.style.display = 'block'; // Ensure intro is visible

  // Set the main introduction title
  if (introTitleElement) {
    introTitleElement.textContent = ''; // You can change this text
  }

  // Logic for the "Start" button in the intro section
  if (introSection && showOutlineButton && courseOutline) {
    showOutlineButton.addEventListener('click', () => {
      if (introSection) introSection.style.display = 'none'; // Hide main intro
      displayItemContent(0); // Transition to course outline
    });
  } else {
    console.error('Required elements for intro/outline toggle not found. Check IDs: showOutlineBtn, courseOutline, and class: intro-section.');
  }

  // --- Unit Introduction Logic ---

  function showCourseOutlineView() {
    if (introSection) introSection.style.display = 'none'; // Hide main intro
    if (pdfViewer) pdfViewer.style.display = 'none';
    if (belowBackBtnDiv) belowBackBtnDiv.style.display = 'none';
    if (unitIntroductionsContainer) unitIntroductionsContainer.style.display = 'none';
    if (courseOutline) courseOutline.style.display = 'block'; // Show course outline
    currentIndex = null; // Reset index when returning to outline
  }

  function showUnitIntroductionView(introContentId) {
    if (introSection) introSection.style.display = 'none';
    if (courseOutline) courseOutline.style.display = 'none';
    if (pdfViewer) pdfViewer.style.display = 'none';
    if (belowBackBtnDiv) belowBackBtnDiv.style.display = 'none';

    if (unitIntroductionsContainer) {
      unitIntroductionsContainer.style.display = 'block';
      const allIntroContents = unitIntroductionsContainer.querySelectorAll('.unit-introduction-content');
      allIntroContents.forEach(content => {
        content.style.display = (content.id === introContentId) ? 'block' : 'none';
      });
    } else {
      console.error("Unit introductions container not found.");
    }
  }

  unitSubtitles.forEach(subtitle => {
    subtitle.addEventListener('click', () => {
      const introId = subtitle.dataset.unitIntroId;
      if (introId) showUnitIntroductionView(introId);
    });
  });

  startUnitBtns.forEach(button => {
    button.addEventListener('click', () => {
      const targetItemId = button.dataset.targetItemId;
      const targetItemElement = document.getElementById(targetItemId); // This should be the Pre-Test item
      const targetIndex = targetItemElement ? allNavigableItems.indexOf(targetItemElement) : -1;
      if (targetIndex > -1) displayItemContent(targetIndex); // Display the Pre-Test
    });
  });

  unitIntroBackBtns.forEach(button => button.addEventListener('click', showCourseOutlineView));
});