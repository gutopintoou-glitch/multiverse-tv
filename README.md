# Multiverse TV - local demo

## Requisitos
- Node.js 18+ / npm
- (opcional) nodemon

## Instalação
1. Copie os arquivos numa pasta `multiverse-tv`
2. `cd multiverse-tv`
3. Copie `.env.example` para `.env` e ajuste as variáveis se desejar.
4. Instale dependências:
   ```bash
   npm install
   ```
5. Gere o banco e seed (opcional se quiser usar já o multiverse.db incluído):
   ```bash
   npm run seed
   ```
6. Inicie:
   ```bash
   npm start
   ```
7. Abra: `http://localhost:3000`

## Observações
- InfinityFree does NOT support Node.js servers. See notes below.
- Player suporta HLS via `hls.js` (o projeto inclui um loader local que usa CDN se preferir).
- Para produção, proteja a sessão, use HTTPS, e troque secrets.
