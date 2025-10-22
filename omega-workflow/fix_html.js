const fs = require('fs');

// Read the original HTML file
let html = fs.readFileSync('/home/ubuntu/contract1/omega-workflow/documents.html', 'utf8');

// Only replace href attributes that contain zuva.ai - preserve everything else
html = html.replace(/href\s*=\s*["']([^"']*zuva\.ai[^"']*)["']/gi, 'href="#"');

// Remove the comment line that references the original Zuva URL
html = html.replace(/<!--[\s\S]*?url: https:\/\/us2\.analyze\.zuva\.ai[^>]*?-->/g, '<!-- Page cleaned of external links -->');

// Add a script at the end to prevent all navigation without breaking styling
const preventNavScript = `
<script>
// Prevent all navigation while keeping the page interactive
document.addEventListener('DOMContentLoaded', function() {
    // Prevent all link clicks
    document.addEventListener('click', function(e) {
        // Check if clicked element or any parent is a link
        let target = e.target;
        while (target && target !== document.body) {
            if (target.tagName === 'A' || target.hasAttribute('href')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            target = target.parentElement;
        }
    }, true);
    
    // Disable all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            return false;
        });
    });
    
    // Override window.location changes
    Object.defineProperty(window, 'location', {
        set: function() {
            console.log('Navigation blocked');
            return false;
        }
    });
});
</script>
</body>`;

// Replace closing body tag with script
html = html.replace('</body>', preventNavScript);

// Write the fixed HTML
fs.writeFileSync('/home/ubuntu/contract1/omega-workflow/documents_fixed.html', html);
console.log('HTML fixed successfully! All styling preserved, only navigation disabled.');