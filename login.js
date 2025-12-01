window.DHLApp = window.DHLApp || {};
(function (app) {
  const auth = {
    token: null,
    setToken(t){ this.token = t; },
    clearToken(){ this.token = null; },
    getAuthHeaders(){
      if(!this.token) return {};
      return { Authorization: "Bearer " + this.token };
    }
  };
  app.auth = auth;
})(window.DHLApp);