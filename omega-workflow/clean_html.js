const fs = require('fs');

// Read the HTML file
let html = fs.readFileSync('/home/ubuntu/contract1/omega-workflow/documents.html', 'utf8');

// Remove all Zuva-related URLs
html = html.replace(/https?:\/\/[^"'\s]*zuva\.ai[^"'\s]*/gi, '#');

// Remove href attributes that contain zuva
html = html.replace(/href\s*=\s*["'][^"']*zuva[^"']*["']/gi, 'href="#"');

// Disable all onClick handlers and navigation
html = html.replace(/onClick\s*=\s*["'][^"']*["']/gi, 'onClick="return false;"');
html = html.replace(/onclick\s*=\s*["'][^"']*["']/gi, 'onclick="return false;"');

// Replace window.location references with no-op
html = html.replace(/window\.location[^;]*/g, '/* disabled navigation */');

// Add a script at the end to disable all navigation
const disableScript = `
<script>
// Disable all link navigation
document.addEventListener('DOMContentLoaded', function() {
    // Disable all links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            return false;
        });
        link.href = '#';
    });
    
    // Disable all buttons that might navigate
    document.querySelectorAll('button').forEach(button => {
        const originalClick = button.onclick;
        button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    });
});
</script>
</body>`;

html = html.replace('</body>', disableScript);

// Write the cleaned HTML
fs.writeFileSync('/home/ubuntu/contract1/omega-workflow/documents_clean.html', html);
console.log('HTML cleaned successfully!');