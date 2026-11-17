Como atualizar as datas alugadas

As datas alugadas aparecem no calendário do site, riscadas e sem poder ser escolhidas. Elas ficam guardadas no arquivo datas.js, que é gerado pela página admin.html. Não é preciso editar código.

Passo a passo
- Abra o admin.html no navegador (dois cliques no arquivo, direto da pasta do projeto no seu computador). Ele mostra as datas que já estão alugadas.
- Marque ou libere as datas de um destes jeitos:
- clicando nos dias do calendário: um clique marca como alugado, outro clique libera;
em "Marcar ou liberar um período", escolhendo as datas De e Até e clicando em "Marcar como alugado" ou "Liberar período";
na lista "Períodos alugados", clicando em "Liberar" no período que você quer soltar.
- Clique em "Baixar datas.js".
- Troque o arquivo: coloque o datas.js baixado na pasta do projeto, no lugar do antigo.
- Publique de novo:
- GitHub Pages: no repositório, clique em Add file → Upload files, envie o novo datas.js e confirme em Commit changes. O site atualiza sozinho em alguns minutos.
- Netlify: abra o site no painel, vá em Deploys e arraste a pasta do projeto de novo.
- Confira: abra o site e atualize a página. Se não mudar, force a atualização com Ctrl + F5.

As alterações só valem depois do passo 5. Se você fechar o admin.html sem baixar o arquivo, elas se perdem.

Cuidado importante

O admin.html sempre começa pelo que está no datas.js da sua pasta. Por isso, mantenha sempre a versão mais recente desse arquivo no seu computador e no repositório. Com um datas.js antigo, datas que você já tinha marcado voltam a aparecer como livres.

Editando o arquivo à mão (opcional)

O datas.js é uma lista de períodos. Cada período inclui o primeiro e o último dia, no formato AAAA-MM-DD:

js
window.ALUGADOS = [
    { de: "2026-12-24", ate: "2026-12-27" },
    { de: "2027-01-16", ate: "2027-01-17" },
];
Para um único dia, repita a data em de e ate.
Para liberar uma data, apague a linha dela.
