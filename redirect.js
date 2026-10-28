// GitHub Pages is static: forward visitors (and Stripe's ?session_id= returns) to the real app server
location.replace('https://ssjosedaniel.pythonanywhere.com/' + location.search + location.hash);
