fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=ab`)
  .then(res => console.log('res.ok:', res.ok, 'status:', res.status))
  .catch(e => console.error(e));
