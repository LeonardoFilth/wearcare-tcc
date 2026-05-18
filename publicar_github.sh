#!/bin/bash
# ============================================================
#  WearCare — Script de publicação no GitHub
#
#  Como usar:
#    1. Abra o terminal na pasta raiz do projeto
#    2. Execute: bash publicar_github.sh
#    3. Quando pedir o URL, cole o link do seu repositório GitHub
# ============================================================

set -e  # Para se qualquer comando falhar

echo ""
echo "========================================"
echo "  🩺 WearCare — Publicar no GitHub"
echo "========================================"
echo ""

# 1. Verifica se git está instalado
if ! command -v git &> /dev/null; then
  echo "❌ Git não encontrado. Instale em: https://git-scm.com"
  exit 1
fi

# 2. Verifica se .env existe (não deve ser commitado)
if [ -f "backend/.env" ]; then
  echo "✅ .env encontrado e protegido pelo .gitignore"
else
  echo "⚠️  backend/.env não encontrado. Lembre de criar a partir do .env.example antes de rodar."
fi

# 3. Inicializa o repositório Git (se ainda não existe)
if [ ! -d ".git" ]; then
  echo "→ Inicializando repositório Git..."
  git init
  git branch -M main
  echo "✅ Repositório inicializado"
else
  echo "✅ Repositório Git já existe"
fi

# 4. Cria o .gitignore se não existir
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOF'
.env
.env.local
node_modules/
dist/
build/
*.log
.DS_Store
*.dump
*.sql.gz
.pio/
secrets.h
EOF
  echo "✅ .gitignore criado"
fi

# 5. Adiciona todos os arquivos (respeitando o .gitignore)
echo ""
echo "→ Adicionando arquivos..."
git add .

# 6. Mostra o que vai ser commitado
echo ""
echo "📋 Arquivos que serão publicados:"
git status --short
echo ""

# 7. Cria o commit
COMMIT_MSG="feat: WearCare TCC - sistema completo de monitoramento de idosos"
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "⚠️  Nada novo para commitar (ou commit já existe)"

# 8. Pede a URL do repositório
echo ""
echo "Cole o URL do seu repositório GitHub."
echo "Exemplo: https://github.com/seuusuario/wearcare-tcc.git"
echo ""
read -p "URL do repositório: " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌ URL não informada. Abortando."
  exit 1
fi

# 9. Adiciona o remote (ou atualiza se já existir)
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
  echo "✅ Remote 'origin' atualizado"
else
  git remote add origin "$REPO_URL"
  echo "✅ Remote 'origin' adicionado"
fi

# 10. Envia para o GitHub
echo ""
echo "→ Enviando para o GitHub..."
git push -u origin main

echo ""
echo "========================================"
echo "  ✅ Projeto publicado com sucesso!"
echo "========================================"
echo ""
echo "🔗 Acesse: ${REPO_URL%.git}"
echo ""
echo "📌 IMPORTANTE — Verifique se estes arquivos NÃO apareceram:"
echo "   ❌ backend/.env"
echo "   ❌ node_modules/"
echo "   ❌ qualquer arquivo com senha ou chave"
echo ""
echo "✅ Arquivos que DEVEM aparecer:"
echo "   ✓ backend/.env.example  (modelo sem senhas)"
echo "   ✓ database/schema.sql"
echo "   ✓ database/seed.sql"
echo "   ✓ README.md"
echo "   ✓ firmware/wearable_esp32.ino"
echo ""
