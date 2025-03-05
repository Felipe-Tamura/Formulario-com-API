const $ = (element) => document.querySelector(element);

$("#formMensagem").addEventListener("submit", async (e) =>{
    e.preventDefault(); // Evitando o evento padrão de clique

    // Obtendo dados do formulário
    const formData = new FormData(e.target);

    try{
        // Enviando solicitação para API
        const response = await fetch('SUA_URL_DA_API_AQUI', { method: 'POST', body: formData});
        // Obtendo resposta da API
        const data = await response.json();

        // Verificação da resposta
        if(data.success){
            alert("Mensagem enviada!");
        }else{
            alert("Mensagem não enviada!");
        }
    }catch (error){
        console.log(error.message);
    }
})