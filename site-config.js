/* =====================================================================
   AMOR SEM FRONTEIRAS - ÚNICO LUGAR PARA TROCAR LINKS E FRASES DA DEMONSTRAÇÃO
   Deixe o link vazio ("") enquanto o produto não estiver no ar: o botão mostra "Em breve".
   ===================================================================== */
window.ASF = {
  PLAY_URL:  "",   // TROQUE AQUI: link do app na Google Play (https://play.google.com/store/apps/details?id=...)
  EBOOK_URL: "https://www.amazon.com.br/dp/B0F16T9FC4",   // link de compra do e-book na Amazon
  EBOOK_PRECO: "R$ 27,99",        // PREÇO NORMAL do e-book (é o que aparece quando não há promoção e depois que ela acaba)
  // PROMOÇÃO (opcional): preço promocional + data/hora final no formato "AAAA-MM-DDTHH:MM:SS" (horário de Brasília).
  // Enquanto a data não chegar, o site mostra o preço promocional e os contadores.
  // Quando a data passar, o preço volta SOZINHO para o EBOOK_PRECO e os contadores somem (nada a fazer, nem recarregar a página).
  // Para encerrar antes, ou para não ter promoção, deixe OFERTA_FIM: "".
  // Exemplo: EBOOK_PRECO_PROMO: "R$ 19,99",  OFERTA_FIM: "2026-11-30T23:59:59",
  EBOOK_PRECO_PROMO: "R$ 4,99",
  OFERTA_FIM: "2026-11-30T23:59:59",

  /* ===================================================================
     CHECKLIST GRATUITO (checklist.html e obrigado.html)
     Como funciona: a pessoa preenche nome e e-mail em checklist.html; o site envia esses dois
     dados para um serviço de formulário, que repassa por e-mail para a caixa de contato.
     Se o envio der certo, a página obrigado.html é liberada e mostra o botão de download.
     PASSO A PASSO PARA ATIVAR (leva 2 minutos):
       1) Acesse https://web3forms.com, informe amorsfronteira@gmail.com. e receba a "Access Key" por e-mail.
       2) Cole a chave abaixo em CHECKLIST_FORM_KEY.
       3) Coloque o PDF do checklist na pasta assets/ com o nome definido em CHECKLIST_PDF.
     Enquanto a chave estiver vazia, o formulário NÃO libera o download (mostra um aviso).
     ================================================================== */
  CHECKLIST_FORM_URL: "https://api.web3forms.com/submit",   // endereço que recebe o formulário (Web3Forms)
  CHECKLIST_FORM_KEY: "0fce50fa-9752-49ad-ad58-7ba5493a965f", // TROQUE AQUI: Access Key recebida por e-mail (não é senha; pode ficar no site)
  CHECKLIST_PDF: "assets/checklist-amor-sem-fronteiras.pdf", // TROQUE AQUI se usar outro nome de arquivo
  CONTATO_EMAIL: "amorsfronteira@gmail.com",           // aparece nas mensagens de erro do formulário
  FRASES: [        // TROQUE AQUI: frases da demonstração (trocam a cada 5 segundos na home)
    "Mesmo de longe, guardo você no melhor lugar de mim, e isso me basta.",
    "Hoje o dia só fez sentido quando lembrei que você existe.",
    "Se a saudade fosse distância, eu já teria atravessado o mundo.",
    "Tem gente que chega e muda o jeito de a gente acordar. Você mudou o meu.",
    "Pode ter um oceano no meio. Ainda assim, é de você que eu mais estou perto.",
    "Quando eu penso em casa, não penso em lugar. Penso em você.",
    "Você é a minha parte favorita de qualquer dia, sem nem precisar tentar."
  ]
};
