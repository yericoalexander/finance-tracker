export type Locale = 'id' | 'en'

export const translations = {
  id: {
    // Header
    greeting: 'Halo',
    themeLight: 'Mode Terang',
    themeDark: 'Mode Gelap',
    switchThemeLight: 'Beralih ke mode terang',
    switchThemeDark: 'Beralih ke mode gelap',
    hideAmounts: 'Sembunyikan nominal uang',
    showAmounts: 'Tampilkan nominal uang',
    langToggle: 'Ganti ke English',
    langName: 'Indonesia',
    accountMenu: 'Menu akun',

    // Profile Dropdown
    settings: 'Pengaturan',
    help: 'Bantuan',
    feedback: 'Beri masukan',
    logout: 'Keluar',
    switchLangOption: 'Ganti Bahasa (English)',

    // Bottom Navigation
    navOverview: 'Ringkasan',
    navWallets: 'Dompet',
    navTransactions: 'Transaksi',
    navAdd: 'Catat',

    // Sync & Status
    syncedToSheets: 'Tersinkron ke Sheets',
    refresh: 'Segarkan',
    refreshing: 'Menyegarkan...',

    // Summary Card
    expensesThisMonth: 'PENGELUARAN BULAN INI',
    expensesPeriod: 'PENGELUARAN {month}',
    averageExpenses: 'RATA-RATA PENGELUARAN',
    total: 'Total',
    daily: '/ Hari',
    dailyAverageText: '{month} · rata-rata {avg} / hari',
    basedOnDays: 'Berdasarkan {days} hari di {month}',
    txRecorded: '{count} transaksi tercatat',
    thisMonth: 'Bulan Ini',
    spreadsheetTitle: 'Spreadsheet',
    spreadsheetSub: 'Google Sheets pribadi',

    // Budget & Reminder
    budgetReminderBtn: 'Atur Batas',
    budgetReminderActive: 'Batas: {limit}',
    budgetModalTitle: 'Batas Pengeluaran',
    budgetModalDesc:
      'Dapatkan notifikasi otomatis di ponsel saat pengeluaran Anda mencapai batas yang ditentukan.',
    budgetActiveToggle: 'Aktifkan Pengingat Pengeluaran',
    budgetLimitLabel: 'Batas Pengeluaran Bulanan',
    budgetLimitPlaceholder: 'Misal: 1.500.000',
    budgetCustomMsgLabel: 'Pesan Kustom',
    budgetCustomMsgPlaceholder: 'Misal: Yuk ngerem jajan, ingat tabungan!',
    budgetCustomMsgHint: 'Nominal pengeluaran & batas otomatis disertakan sistem.',
    budgetInsertTotal: '+ Total',
    budgetInsertLimit: '+ Batas',
    budgetSaveBtn: 'Simpan Pengaturan',
    budgetSavingBtn: 'Menyimpan...',
    budgetSavedSuccess: 'Pengaturan pengingat berhasil disimpan',
    budgetRemaining: 'Sisa {amount}',
    budgetOverLimit: 'Lebih {amount} dari batas',
    budgetOfLimit: 'dari {limit}',
    budgetRemainingLabel: 'Sisa anggaran',
    budgetOverLimitLabel: 'Kelebihan anggaran',
    budgetEditLink: 'Ubah',
    budgetPercentOfLimit: '{percent}% dari batas {limit}',
    budgetCurrentExpenses: 'Pengeluaran saat ini:',
    budgetToggleOn: 'Notifikasi aktif saat mencapai batas',
    budgetToggleOff: 'Pengingat dimatikan sementara',
    budgetTagVariables: 'Tag variabel:',
    budgetMinLimitError: 'Batas pengeluaran minimal Rp 10.000',
    budgetEarlyWarningToggle: 'Peringatan Dini',
    budgetEarlyWarningDesc: 'Pilih persentase batas pengeluaran untuk menerima peringatan awal',
    budgetWarningThresholdLabel: 'Peringatan',
    budgetWarningThresholdDesc: 'Beri tahu saat {percent}% ({amount}) & batas 100%',
    budgetWarningThreshold100: 'Hanya beri tahu saat mencapai batas 100% ({amount})',
    budgetWarningThresholdOff: 'Peringatan awal dinonaktifkan (hanya saat 100%)',
    budgetAntiSpamNote:
      'Anti-Spam: Notifikasi hanya dikirim sekali saat menembus ambang batas, tidak membombardir transaksi kecil berikutnya.',
    budgetBannerOverTitle: '🚨 Batas Anggaran Terlampaui!',
    budgetBannerOverDesc:
      'Pengeluaran bulan ini sudah {total} (melebihi batas {limit} sebesar {over}).',
    budgetBannerWarningTitle: '⚠️ Peringatan: Pengeluaran Sudah {percent}%!',
    budgetBannerWarningDesc:
      'Pengeluaran bulan ini sudah {percent}% ({total} dari batas {limit}). Sisa: {remaining}.',
    budgetEnableWebNotif: 'Nyalakan notifikasi browser',

    // Month Navigator
    prevMonth: 'Bulan sebelumnya',
    nextMonth: 'Bulan berikutnya',
    selectMonth: 'Pilih bulan pengeluaran',

    // Category Breakdown
    categoriesTitle: 'Kategori {month}',
    categoriesThisMonth: 'Kategori Bulan Ini',
    noExpensesPeriod: 'Belum ada catatan pengeluaran di periode ini.',
    filterHint: 'Ketuk kategori di bawah untuk menyaring riwayat transaksi.',
    viewInTransactions: 'Lihat di Transaksi →',
    resetFilter: 'Reset',

    // New Tx Alert
    newTxAlert: '✨ {merchant} baru saja masuk!',
    viewTx: 'Lihat Transaksi',

    // Recent Transactions
    allTransactions: 'Semua transaksi',
    txCountFiltered: '{filtered} dari {total} transaksi',
    searchPlaceholder: 'Cari tempat / merchant / catatan...',
    searchTxPlaceholder: 'Cari transaksi',
    clearSearch: 'Hapus pencarian',
    filterBtn: 'Filter',
    openFilter: 'Buka filter transaksi',
    closeFilter: 'Tutup filter',
    filterAll: 'Semua',
    filterFood: 'Makanan',
    filterTransport: 'Transport',
    filterShopping: 'Belanja',
    filterBills: 'Tagihan',
    filterEntertainment: 'Hiburan',
    filterHealth: 'Kesehatan',
    filterOther: 'Lainnya',
    noTransactionsFound: 'Tidak ada transaksi yang cocok',
    noTransactionsPeriod: 'Belum ada transaksi di bulan ini',
    noTransactionsSub:
      'Ambil screenshot struk/bukti transfer di iPhone lalu Back Tap, atau catat manual.',
    goToAdd: '+ Catat Transaksi Baru',
    resetSearch: 'Reset Pencarian',
    clearFilter: 'Hapus Filter',
    addFirstTx: '+ Tambah Transaksi Pertama',
    noTxMatchFilter: 'Tidak ada transaksi yang cocok dengan filter.',
    noTxRecordedYet: 'Belum ada transaksi yang tercatat.',
    badgeNew: 'Baru',
    fallbackExpense: 'Pengeluaran',
    fallbackOther: 'Lainnya',
    txDeletedSuccess: 'Transaksi berhasil dihapus',
    deletedFromSheetsNotice: 'telah dihapus dari Sheets',
    closeNotification: 'Tutup notifikasi',
    filteredCategoryBreakdown: 'Rincian Kategori Hasil Filter',

    // Filter Sheet
    filterTransactions: 'Filter Transaksi',
    timePeriod: 'Periode Waktu',
    allTime: 'Semua Waktu',
    optToday: 'Hari Ini',
    optYesterday: 'Kemarin',
    opt7Days: '7 Hari',
    optMonth: 'Bulan Ini',
    optRange: 'Rentang',
    dateRange: 'Rentang Tanggal',
    fromDate: 'Dari Tanggal',
    toDate: 'Sampai Tanggal',
    allCategories: 'Semua Kategori',
    applyFilter: 'Terapkan Filter',

    // Transaction Drawer & Details
    detailTitle: 'Detail Transaksi',
    detailAmount: 'Nominal',
    detailMerchant: 'Nama Toko / Merchant',
    detailCategory: 'Kategori',
    detailDate: 'Tanggal Transaksi',
    detailTime: 'Waktu Transaksi',
    detailPayment: 'Metode Pembayaran',
    detailNote: 'Catatan Transaksi',
    btnDeleteTx: 'Hapus Transaksi',
    btnEditTx: 'Simpan Perubahan',

    // Delete Confirmation Modal
    deleteConfirmTitle: 'Hapus Transaksi Ini?',
    deleteConfirmWarning:
      'Data transaksi ini akan dihapus permanen dari Google Sheets dan tidak dapat dikembalikan.',
    deleteDialogTitle: 'Hapus Transaksi?',
    deleteDialogDeleting: 'Menghapus Transaksi...',
    deleteDialogSuccess: 'Berhasil Dihapus!',
    deleteDialogDesc:
      'Transaksi akan dihapus dari aplikasi dan baris di Google Sheets Anda akan otomatis dirapikan tanpa celah kosong.',
    deleteDialogDescDeleting:
      'Sedang menghapus data dari sistem dan merapikan Google Sheets Anda...',
    deleteDialogDescSuccess: 'Transaksi dan baris di Google Sheets telah selesai dirapikan.',
    fieldMerchant: 'Merchant',
    fieldAmount: 'Nominal',
    fieldCategory: 'Kategori',
    fieldDate: 'Tanggal',
    loadingDone: 'Selesai',
    btnCancel: 'Batal',
    btnConfirmDelete: 'Ya, Hapus',
    deletingStatus: 'Menghapus...',
    deletingFromSheets: 'Menghapus dari Google Sheets...',
    deleteSuccess: 'Transaksi Berhasil Dihapus',
    deleteFailed: 'Gagal menghapus transaksi',
    deleteTxAria: 'Hapus transaksi {merchant}',

    // Manual Entry Card
    manualTitle: 'Catat Pengeluaran',
    manualSub: 'Data langsung ditulis ke sheet Transaksi milik kamu',
    labelAmount: 'NOMINAL TRANSAKSI (RP)',
    placeholderAmount: 'Contoh: 50.000',
    labelMerchant: 'NAMA TEMPAT / MERCHANT',
    placeholderMerchant: 'Contoh: Kopi Kenangan, Superindo, MRT',
    labelCategory: 'KATEGORI',
    labelDate: 'TANGGAL',
    btnToday: 'Hari Ini',
    labelPayment: 'METODE PEMBAYARAN',
    labelNote: 'CATATAN (OPSIONAL)',
    placeholderNote: 'Contoh: Kopi susu bareng tim, belanja mingguan...',
    btnSubmitManual: 'Catat Pengeluaran',
    submittingManual: 'Menyimpan ke Sheets...',
    errMerchantRequired: 'Nama merchant atau tempat transaksi wajib diisi',
    errAmountPositive: 'Nominal transaksi harus lebih dari Rp 0',
    manualSuccessMsg: 'Berhasil mencatat {amount} untuk {merchant} ke Google Sheets!',
    manualBackTapTipTitle: '💡 Mau pencatatan otomatis tanpa isi form?',
    manualBackTapTipDesc:
      'Gunakan Shortcut Back Tap di iPhone kamu untuk menangkap struk belanjaan atau notifikasi bank dalam 2 detik langsung ke Google Sheets.',
    amountInterpreted: 'Terbaca: {amount}',
    viewInTxTab: 'Lihat di Tab Transaksi',
    errSaveFailed: 'Gagal mencatat transaksi',
    errSystemError: 'Terjadi kesalahan sistem. Coba beberapa saat lagi.',

    // Device Setup Banner
    deviceBannerTitle: 'Pintasan Belum Terhubung',
    deviceBannerTag: '1-Klik',
    deviceBannerDescPrefix: 'Aktifkan Back Tap iPhone & pilih',
    deviceBannerDescStrong: 'Selalu Izinkan',
    deviceBannerAction: 'Hubungkan',
    deviceBannerAria: 'Hubungkan Pintasan iPhone Sekarang',

    // Shortcut Onboarding Modal
    onboardingModalTitle: 'Pasang Pintasan iPhone',
    onboardingModalSub: 'Halo {name}, siapkan integrasi otomatis',
    onboardingModalDescPart1:
      'Aplikasi ini mencatat pengeluaran langsung dari tangkapan layar iPhone Anda via',
    onboardingModalDescStrong: 'Ketuk Bagian Belakang (Back Tap)',
    onboardingModalDescPart2: 'dalam 2 detik.',
    onboardingWarningTitle: 'Wajib: Pilih "Selalu Izinkan"',
    onboardingWarningDesc: 'Saat iPhone memunculkan konfirmasi izin jaringan untuk pertama kali:',
    onboardingWarningAction: '👉 Pilih: Selalu Izinkan (Always Allow)',
    onboardingWarningNote:
      'Pastikan tidak memilih "Jangan Izinkan" agar pengiriman struk belanja ke Google Sheets Anda tidak terblokir oleh iOS.',
    btnInstallNow: 'Pasang Sekarang (1-Klik)',
    btnLater: 'Nanti Saja',
    closePrompt: 'Tutup jendela saran',

    // Retry Sheet Card
    sheetNotConnected: 'Google Sheet belum terhubung',
    sheetNotConnectedDesc:
      'Spreadsheet transaksi belum selesai dibuat saat proses login sebelumnya.',
    btnRetrySheet: 'Coba hubungkan Google Sheet lagi',
    btnRetrySheetAction: 'Hubungkan Ulang',
    btnRetryingSheet: 'Sedang Menghubungkan...',
    errCreateSheet: 'Gagal membuat Google Sheet. Coba lagi.',
    errNetwork: 'Terjadi gangguan jaringan. Silakan coba lagi.',
    creatingSpreadsheet: 'Sedang membuat spreadsheet...',
    tryAgain: 'Coba lagi',

    // Modals
    modalSettingsTitle: 'Pengaturan',
    labelGoogleAccount: 'Akun Google',
    labelGoogleSheets: 'Google Spreadsheet',
    linkOpenSheets: 'Buka Google Sheets Pribadi →',
    labelIphoneShortcut: 'Shortcut iPhone (Back Tap)',
    linkSetupShortcut: 'Hubungkan / Pasang Ulang Shortcut →',
    btnClose: 'Tutup',

    modalHelpTitle: 'Bantuan & Panduan',
    guideBackTapTitle: '⚡ Cara Catat dengan Back Tap',
    guideBackTapText:
      '1. Ambil screenshot bukti transfer/struk di iPhone.\n2. Ketuk 2x bagian belakang iPhone.\n3. Transaksi otomatis diekstrak AI dan masuk ke Google Sheets & Dashboard ini!',
    guidePwaTitle: '📱 Pasang di Layar Utama (Add to Home Screen)',
    guidePwaText:
      '1. Buka website ini di Safari iPhone.\n2. Ketuk ikon Bagikan (Share).\n3. Pilih "Tambah ke Layar Utama" (Add to Home Screen).',
    btnGotIt: 'Mengerti',

    modalFeedbackTitle: 'Beri Masukan',
    placeholderFeedback: 'Tulis saran atau kendala yang kamu temukan...',
    btnSendFeedback: 'Kirim Masukan',
    feedbackThanks: 'Terima kasih atas masukanmu!',

    // Pair Page Header & Navigation
    pairTitle: 'Pengaturan Perangkat',
    pairSubtitle: 'Hubungkan iPhone dan kelola akses Shortcut',
    backToDashboard: 'Kembali ke Dashboard',

    // Direct Setup Card
    directSetupTitle: 'Khusus Opsi Back Tap (Foto Struk Fisik)',
    directSetupDesc:
      'Khusus bagi Anda yang ingin mencatat pengeluaran dengan mengetuk 2x punggung iPhone untuk memotret struk kasir atau screenshot transfer.',
    labelDeviceName: 'Label Perangkat',
    placeholderDeviceName: 'Contoh: iPhone Rico',
    defaultDevicePrefix: 'iPhone',
    defaultDeviceSuffix: 'Saya',
    privateAndSecure: 'Privat & Aman:',
    privateAndSecureDesc:
      'Setiap perangkat memiliki token unik terenkripsi dan hanya menulis transaksi ke Google Sheets akun Anda.',
    btnCreateAccess: 'Buat Akses iPhone (1-Klik)',
    btnCreatingAccess: 'Menyiapkan Akses...',
    errCreateAccess: 'Gagal membuat akses perangkat',
    errNetworkConnect: 'Terjadi kendala jaringan saat menghubungkan',
    setupSuccessTitle: 'Akses iPhone Berhasil Dibuat!',
    autoConnectBoxTitle: 'Hubungkan ke iPhone Otomatis (1-Klik)',
    autoConnectBoxDesc:
      'Ketuk tombol di bawah. iPhone Anda akan langsung membuka Pintasan dan menyambungkan akun Anda otomatis tanpa perlu ketik apapun.',
    btnConnectNow: '⚡ Hubungkan ke iPhone Sekarang',
    btnInstallFromIcloud: '📲 Belum punya pintasan? Pasang dari iCloud',
    backTapReminderTitle: '💡 Jangan Lupa: Atur Back Tap di iPhone',
    backTapReminderDesc:
      'Buka Pengaturan > Aksesibilitas > Sentuh > Ketuk Bagian Belakang > pilih Finance Tracker pada Ketuk 2x.',
    showManualDetails: 'Ingin Salin Token / Endpoint Manual?',
    hideManualDetails: 'Sembunyikan Nilai Teknis',
    captureEndpointUrl: 'URL Endpoint Capture:',
    secretDeviceToken: 'Token Perangkat Rahasia:',
    connectAnotherDevice: 'Hubungkan Perangkat Lainnya',

    // Shortcut Guide Card
    guideCardTitle: 'Panduan Pintasan & Back Tap',
    guideStep1Title: 'Tekan Tombol "Pasang & Hubungkan Pintasan" di Atas',
    guideStep1Desc:
      'Cukup ketuk tombol hitam di atas sekali saja. iPhone Anda otomatis membuka layar resmi "Tambahkan Pintasan".',
    guideStep2Title: 'Ketuk "Hubungkan ke iPhone Otomatis"',
    guideStep2Desc:
      'Cukup ketuk tombol satu kali. iPhone Anda akan otomatis membuka Pintasan dan menyambungkan akun Anda secara instan tanpa perlu ketik apapun.',
    guideStep3Title: 'Pilih "Selalu Izinkan" (Always Allow)',
    guideStep3Desc:
      'Saat pertama kali pintasan dipakai di iPhone, iOS meminta izin jaringan: wajib pilih Selalu Izinkan agar pengiriman struk belanja tidak terblokir.',
    guideStep4Title: 'Pasang Ketuk Belakang (Back Tap)',
    guideStep4Desc:
      'Buka Pengaturan iPhone → Aksesibilitas → Sentuh → Ketuk Bagian Belakang → Pilih Finance Tracker pada Ketuk Dua Kali.',
    guideDoneTip:
      'Selesai! Kapan pun Anda melihat struk atau bukti transfer di iPhone, cukup ketuk 2x punggung iPhone Anda untuk mencatat pengeluaran otomatis ke Google Sheets.',

    // Device List
    connectedDevicesTitle: 'Perangkat Terhubung ({count})',
    noDevicesConnected: 'Belum ada iPhone yang terhubung.',
    lastActive: 'Terakhir aktif:',
    connectedAt: 'Dihubungkan:',
    btnRevoke: 'Cabut',
    confirmRevoke: 'Apakah Anda yakin ingin mencabut akses perangkat ini?',
    errRevokeDevice: 'Gagal mencabut perangkat',
    errNetworkRevoke: 'Terjadi gangguan jaringan',
    revokeAriaLabel: 'Cabut akses {label}',

    // Setup Gate
    setupGateTitle: 'Pasang Pintasan iPhone',
    setupGateSubtitle:
      'Halo {name}! Pasang pintasan Finance Tracker ke iPhone Anda untuk mulai mencatat pengeluaran otomatis ke Google Sheets pribadi.',
    setupGateSelectModePrompt: 'Pilih Cara Anda Mencatat Transaksi:',
    setupGateModeNotifTitle: 'Otomatis Notifikasi Bank',
    setupGateModeNotifBadge: 'Rekomendasi Utama',
    setupGateModeNotifDesc:
      'Setiap Anda bayar QRIS atau terima transfer di m-banking (BCA, Livin, BRImo, GoPay, dll.), transaksi langsung tercatat otomatis tanpa perlu buka aplikasi.',
    setupGateModeBacktapTitle: 'Back Tap Foto Struk',
    setupGateModeBacktapBadge: 'Foto Struk Fisik',
    setupGateModeBacktapDesc:
      'Ketuk 2x punggung iPhone untuk memotret struk kasir, invoice fisik, atau screenshot. AI Gemini akan membaca total belanja & rincian item.',
    setupGateNotifQuickGuideTitle: 'Petunjuk Ringkas Notifikasi Bank:',
    setupGateNotifGuideItem1: 'Ketuk tombol "Pasang Pintasan Notifikasi" di bawah.',
    setupGateNotifGuideItem2: 'iPhone akan membuka pop-up: ketuk Tambahkan Pintasan.',
    setupGateNotifGuideItem3: 'Token akun terhubung otomatis, Anda tinggal memilih aplikasi bank.',
    setupGateNotifBtnInstall: 'Pasang Pintasan Notifikasi (1-Klik)',
    setupGateBacktapQuickGuideTitle: 'Petunjuk Ringkas Back Tap Struk:',
    setupGateBacktapGuideItem1: 'Ketuk tombol "Pasang Pintasan Back Tap" di bawah.',
    setupGateBacktapGuideItem2: 'iPhone akan membuka pop-up: ketuk Tambahkan Pintasan.',
    setupGateBacktapGuideItem3: 'Token akun terhubung otomatis, Anda tinggal mengaktifkan Back Tap di Pengaturan.',
    setupGateBacktapBtnInstall: 'Pasang Pintasan Back Tap (1-Klik)',
    badgeOptional: 'OPSIONAL',
    setupGateActiveNotifTitle: 'Langkah Terakhir: Aktifkan Otomasi Notifikasi',
    setupGateActiveNotifStep1:
      'Buka tab Otomatisasi (Automation) di aplikasi Pintasan iPhone → Ketuk tanda (+).',
    setupGateActiveNotifStep2:
      'Pilih Pemberitahuan (Notification) dari aplikasi bank Anda (BCA, Livin, BRImo, GoPay, dll.).',
    setupGateActiveNotifStep3:
      'Pilih aksi Jalankan Pintasan → Pilih Finance Tracker → Aktifkan "Jalankan Segera". Selesai!',
    setupGateActiveBacktapTitle: 'Langkah Terakhir: Aktifkan Back Tap di iPhone',
    setupGateActiveBacktapStep1:
      'Buka Pengaturan iPhone → Aksesibilitas → Sentuh → Ketuk Bagian Belakang (Back Tap).',
    setupGateActiveBacktapStep2: 'Pilih "Ketuk Dua Kali" (Double Tap) atau "Ketuk Tiga Kali".',
    setupGateActiveBacktapStep3:
      'Gulir ke bawah ke bagian Pintasan → Centang "Finance Tracker". Selesai!',
    setupGateDualSupportTip:
      '💡 Tips: Pintasan yang sama mendukung kedua fitur sekaligus! Anda dapat mengaktifkan Notifikasi dan Back Tap kapan saja di iPhone.',
    setupGateReadyTitle: 'Siap Dihubungkan ke iPhone!',
    setupGateReadySub: 'Koneksi otomatis langsung ke Google Sheets ({email})',
    setupGateStepTitle: 'Langkah 1-Klik Otomatis:',
    setupGateStepDesc:
      'Ketuk tombol di bawah. iPhone Anda akan otomatis membuka Pintasan dan menyimpan koneksi akun Anda tanpa perlu ketik apapun.',
    setupGateBtnConnectAuto: 'Hubungkan ke iPhone Otomatis',
    setupGateNotInstalledYet: 'Belum punya pintasan di iPhone? Pasang sekali saja:',
    setupGateBtnInstallIcloud: 'Pasang Pintasan (iCloud)',
    setupGateBtnFinishDashboard: 'Selesai & Buka Dashboard',
    setupGateQuickGuideTitle: 'Petunjuk Cepat di Layar iPhone:',
    setupGateGuideItem1: 'Ketuk tombol "Pasang & Hubungkan Pintasan" di bawah.',
    setupGateGuideItem2: 'iPhone akan membuka pop-up: ketuk Tambahkan Pintasan (Add Shortcut).',
    setupGateGuideItem3: 'Saat pertama kali dipakai, pilih: Selalu Izinkan (Always Allow).',
    setupGateBtnInstall1Click: 'Pasang & Hubungkan Pintasan (1-Klik)',
    setupGateBtnInstalling: 'Menghubungkan...',
    setupGateSkipWithoutIphone: 'Lanjut ke Dashboard tanpa iPhone',
    setupGateLogout: 'Keluar',

    // PWA Guide Card
    pwaGuideCardTitle: 'Pasang di Layar Utama iPhone',
    pwaGuideCardSub: 'Buka cepat tanpa bilah alamat Safari',
    pwaStep1Title: 'Ketuk Bagikan',
    pwaStep1Desc: 'Tekan ikon kotak berpanah ke atas di bilah bawah browser Safari.',
    pwaStep2Title: 'Pilih "Tambah ke Layar Utama"',
    pwaStep2Desc: 'Gulir menu opsi ke bawah hingga menemukan menu ini.',
    pwaStep3Title: 'Ketuk "Tambah"',
    pwaStep3Badge: 'Tambah',
    pwaStep3Desc: 'Tombol di pojok kanan atas. Ikon aplikasi langsung terpasang di layar utama.',
    pwaCallout:
      'Aplikasi akan terbuka layar penuh tanpa bilah Safari dan tanpa membuat tab browser menumpuk.',
    guideBadge: 'Panduan',
    closeSuggestion: 'Tutup saran',

    // Toast
    switchedToEnglish: '🇬🇧 Bahasa diubah ke English (Nominal tetap Rupiah)',
    switchedToIndonesian: '🇮🇩 Bahasa diubah ke Indonesia',

    // Login Page
    loginDriveNoticeBadge: 'Penting Saat Masuk',
    loginDriveNoticeTitle: 'Wajib Centang Izin Google Drive',
    loginDriveNoticeDesc:
      'Pada layar Google berikutnya, pastikan centang kotak izin Google Drive agar Finance Tracker dapat otomatis membuatkan Google Sheets untuk mencatat keuanganmu.',
    loginCheckboxSample:
      'Lihat, buat, dan edit file Google Drive tertentu yang Anda gunakan dengan aplikasi ini',
    loginCheckboxWarning:
      'Jika kotak ini tidak dicentang, spreadsheet transaksi tidak bisa dibuat.',
    loginPermissionSummary:
      'Izin yang diminta: akses email dan akun Google, serta membuat file spreadsheet baru di Google Drive milikmu. Kami tidak membaca file lain di Drive-mu.',
    loginBtnGoogle: 'Lanjutkan dengan Google',
    loginConnecting: 'Menghubungkan...',
    loginTermsNotice: 'Dengan masuk, kamu menyetujui',
    termsOfService: 'Ketentuan Layanan',
    privacyPolicy: 'Kebijakan Privasi',
    loginError: 'Gagal terhubung ke Google. Coba lagi.',

    // Notification Guide Card
    notifGuideBadge: 'DIREKOMENDASIKAN',
    notifGuideTitle: 'Auto-Catat Notifikasi Bank & QRIS',
    notifGuideSub: 'Paling praktis — tercatat otomatis tanpa perlu membuka aplikasi (< 0.5 dtk)',
    notifGuideSummary:
      'Setiap Anda bayar QRIS atau ada transfer masuk di BCA, Mandiri, BRI, GoPay, dll., iPhone akan otomatis mencatatnya secara senyap ke Google Sheets akun Anda.',
    notifGuideBtnInstall: 'Pasang Pintasan Notifikasi (1-Klik)',
    notifGuideBtnInstalling: 'Memasang Pintasan...',
    notifGuideBtnInstalled: 'Pintasan Terhubung! Pasang Ulang?',
    notifStep1Title: 'Pasang Pintasan Otomatis',
    notifStep1Desc:
      'Ketuk tombol "Pasang Pintasan Notifikasi (1-Klik)" di atas. Pintasan resmi Finance Tracker akan langsung terpasang dan token akun terkonfigurasi otomatis di iPhone Anda.',
    notifStep2Title: 'Buat Otomatisasi Notifikasi di iPhone',
    notifStep2Desc:
      'Buka tab Otomatisasi (Automation) di aplikasi Pintasan iPhone → Ketuk tanda (+) → Pilih Pemberitahuan (Notification) dari aplikasi m-banking atau e-wallet Anda (BCA, Livin, GoPay, dll.).',
    notifStep3Title: 'Pilih Aksi "Jalankan Pintasan"',
    notifStep3Desc:
      'Pilih aksi Jalankan Pintasan (Run Shortcut) → Pilih Finance Tracker → Aktifkan "Jalankan Segera" (Run Immediately). Selesai!',
    notifTipsDesc:
      '100% Otomatis: Tidak perlu mengetik URL, token, atau webhook secara manual. Semua sudah diatur otomatis di dalam pintasan.',
    notifCloseGuideAria: 'Tutup panduan notifikasi',
    notifOpenGuideAria: 'Buka panduan notifikasi',

    // Wallet Section & Cards
    walletBalance: 'Saldo Dompet',
    walletCardsCount: '{count} kartu aktif tersimpan',
    walletTitle: 'Dompet',
    walletStackCards: 'Tumpuk kartu',
    walletExpandCards: 'Buka semua kartu',
    walletShowBalanceAria: 'Tampilkan saldo',
    walletHideBalanceAria: 'Sembunyikan saldo',
    walletMenuAria: 'Menu opsi dompet',
    walletReloadAll: 'Muat Ulang Semua Bank',
    walletAddNew: 'Tambah Kartu Baru',
    walletEmptyTitle: 'Tambah kartu dompet pertamamu',
    walletActiveCard: 'KARTU AKTIF',
    walletTapToSelect: 'Ketuk untuk pilih kartu',
    walletTapToEdit: 'Ketuk untuk ubah kartu',
    walletEdit: 'Ubah',
    walletDelete: 'Hapus',
    walletAddCash100k: '+100 rb',
    walletAddCash500k: '+500 rb',
    walletAddCash1m: '+1 jt',

    // Wallet Modal
    walletModalAddTitle: 'Tambah Kartu Baru',
    walletModalEditTitle: 'Ubah Kartu',
    walletModalSub: 'Atur nominal kartu bank & e-wallet kamu',
    walletModalCardNameLabel: 'NAMA KARTU / BANK',
    walletModalCardNamePlaceholder: 'Contoh: BCA Prioritas, Livin Mandiri',
    walletModalBalanceLabel: 'NOMINAL SALDO SAAT INI',
    walletModalBalancePlaceholder: 'Rp 0',
    walletModalLastDigitsLabel: '4 DIGIT TERAKHIR (OPSIONAL)',
    walletModalLastDigitsPlaceholder: 'Contoh: 8821',
    walletModalAppearanceLabel: 'PENERBIT & TAMPILAN',
    walletModalStandardBank: 'Standar Bank Elegan',
    walletModalTabConventional: 'Bank Konvensional',
    walletModalTabDigital: 'Digital & E-Wallet',
    walletModalTabCustom: 'Kustom / Logam',
    walletModalCustomColorLabel: 'Pilih Warna Elegan',
    walletModalColorPickerTitle: 'Pilih Bebas (Color Picker)',
    walletModalColorPickerSub: 'Ketuk lingkaran untuk membuka palet warna',
    walletModalCancel: 'Batal',
    walletModalSave: 'Simpan Perubahan',
    walletModalAdd: 'Tambahkan Kartu',
    walletModalSaveAdd: 'Simpan Dompet Baru',
    walletModalSaveEdit: 'Perbarui Saldo',
    walletModalSectionMetal: 'EDISI LOGAM & KHUSUS',
    walletModalSectionSwatches: 'PALET SWATCH ELEGAN',
    navDashboardTabsAria: 'Pilihan navigasi dashboard',
  },
  en: {
    // Header
    greeting: 'Hello',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    switchThemeLight: 'Switch to light mode',
    switchThemeDark: 'Switch to dark mode',
    hideAmounts: 'Hide monetary amounts',
    showAmounts: 'Show monetary amounts',
    langToggle: 'Switch to Indonesia',
    langName: 'English',
    accountMenu: 'Account menu',

    // Profile Dropdown
    settings: 'Settings',
    help: 'Help',
    feedback: 'Send feedback',
    logout: 'Log out',
    switchLangOption: 'Switch Language (Indonesia)',

    // Bottom Navigation
    navOverview: 'Overview',
    navWallets: 'Wallets',
    navTransactions: 'Transactions',
    navAdd: 'Add',

    // Sync & Status
    syncedToSheets: 'Synced to Sheets',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',

    // Summary Card
    expensesThisMonth: 'EXPENSES THIS MONTH',
    expensesPeriod: 'EXPENSES IN {month}',
    averageExpenses: 'AVERAGE EXPENSES',
    total: 'Total',
    daily: '/ Day',
    dailyAverageText: '{month} · average {avg} / day',
    basedOnDays: 'Based on {days} days in {month}',
    txRecorded: '{count} transactions recorded',
    thisMonth: 'This Month',
    spreadsheetTitle: 'Spreadsheet',
    spreadsheetSub: 'Personal Google Sheets',

    // Budget & Reminder
    budgetReminderBtn: 'Set Limit',
    budgetReminderActive: 'Limit: {limit}',
    budgetModalTitle: 'Spending Limit',
    budgetModalDesc:
      'Get automatic notifications on your phone when your spending hits your monthly threshold.',
    budgetActiveToggle: 'Enable Spending Reminder',
    budgetLimitLabel: 'Monthly Spending Limit',
    budgetLimitPlaceholder: 'E.g., 1,500,000',
    budgetCustomMsgLabel: 'Custom Message',
    budgetCustomMsgPlaceholder: 'E.g., Time to slow down, remember our savings!',
    budgetCustomMsgHint: 'Amount & limit are automatically included by the system.',
    budgetInsertTotal: '+ Total',
    budgetInsertLimit: '+ Limit',
    budgetSaveBtn: 'Save Settings',
    budgetSavingBtn: 'Saving...',
    budgetSavedSuccess: 'Reminder settings saved successfully',
    budgetRemaining: '{amount} remaining',
    budgetOverLimit: '{amount} over limit',
    budgetOfLimit: 'of {limit}',
    budgetRemainingLabel: 'Remaining budget',
    budgetOverLimitLabel: 'Over budget',
    budgetEditLink: 'Edit',
    budgetPercentOfLimit: '{percent}% of {limit} limit',
    budgetCurrentExpenses: 'Current spending:',
    budgetToggleOn: 'Notification triggers when limit reached',
    budgetToggleOff: 'Reminders temporarily turned off',
    budgetTagVariables: 'Variable tags:',
    budgetMinLimitError: 'Minimum spending limit is Rp 10,000',
    budgetEarlyWarningToggle: 'Early Warning',
    budgetEarlyWarningDesc: 'Choose spending threshold percentage to receive an early alert',
    budgetWarningThresholdLabel: 'Warning',
    budgetWarningThresholdDesc: 'Notify at {percent}% ({amount}) & 100% limit',
    budgetWarningThreshold100: 'Only notify when reaching full 100% limit ({amount})',
    budgetWarningThresholdOff: 'Early warning disabled (only 100% limit alert)',
    budgetAntiSpamNote:
      'Anti-Spam: Alerts are sent once upon crossing the threshold, not spamming subsequent small transactions.',
    budgetBannerOverTitle: '🚨 Spending Limit Exceeded!',
    budgetBannerOverDesc: 'Spending this month has reached {total} (over limit {limit} by {over}).',
    budgetBannerWarningTitle: '⚠️ Warning: Spending Reached {percent}%!',
    budgetBannerWarningDesc:
      'Spending this month has reached {percent}% ({total} of {limit} limit). Remaining: {remaining}.',
    budgetEnableWebNotif: 'Enable browser notifications',

    // Month Navigator
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    selectMonth: 'Select expense month',

    // Category Breakdown
    categoriesTitle: 'Categories in {month}',
    categoriesThisMonth: 'Categories This Month',
    noExpensesPeriod: 'No expense records found in this period.',
    filterHint: 'Tap a category below to filter transaction history.',
    viewInTransactions: 'View in Transactions →',
    resetFilter: 'Reset',

    // New Tx Alert
    newTxAlert: '✨ {merchant} just recorded!',
    viewTx: 'View Transaction',

    // Recent Transactions
    allTransactions: 'All transactions',
    txCountFiltered: '{filtered} of {total} transactions',
    searchPlaceholder: 'Search place / merchant / note...',
    searchTxPlaceholder: 'Search transactions',
    clearSearch: 'Clear search',
    filterBtn: 'Filter',
    openFilter: 'Open transaction filter',
    closeFilter: 'Close filter',
    filterAll: 'All',
    filterFood: 'Food',
    filterTransport: 'Transport',
    filterShopping: 'Shopping',
    filterBills: 'Bills',
    filterEntertainment: 'Fun',
    filterHealth: 'Health',
    filterOther: 'Others',
    noTransactionsFound: 'No matching transactions found',
    noTransactionsPeriod: 'No transactions recorded for this month',
    noTransactionsSub:
      'Take a screenshot of receipts/transfers on your iPhone then Back Tap, or add manually.',
    goToAdd: '+ Record New Transaction',
    resetSearch: 'Reset Search',
    clearFilter: 'Clear Filter',
    addFirstTx: '+ Add First Transaction',
    noTxMatchFilter: 'No transactions match the current filter.',
    noTxRecordedYet: 'No transactions recorded yet.',
    badgeNew: 'New',
    fallbackExpense: 'Expense',
    fallbackOther: 'Other',
    txDeletedSuccess: 'Transaction deleted successfully',
    deletedFromSheetsNotice: 'has been removed from Sheets',
    closeNotification: 'Close notification',
    filteredCategoryBreakdown: 'Filtered Category Breakdown',

    // Filter Sheet
    filterTransactions: 'Filter Transactions',
    timePeriod: 'Time Period',
    allTime: 'All Time',
    optToday: 'Today',
    optYesterday: 'Yesterday',
    opt7Days: '7 Days',
    optMonth: 'This Month',
    optRange: 'Range',
    dateRange: 'Date Range',
    fromDate: 'From Date',
    toDate: 'To Date',
    allCategories: 'All Categories',
    applyFilter: 'Apply Filter',

    // Transaction Drawer & Details
    detailTitle: 'Transaction Details',
    detailAmount: 'Amount',
    detailMerchant: 'Store / Merchant Name',
    detailCategory: 'Category',
    detailDate: 'Transaction Date',
    detailTime: 'Transaction Time',
    detailPayment: 'Payment Method',
    detailNote: 'Notes',
    btnDeleteTx: 'Delete Transaction',
    btnEditTx: 'Save Changes',

    // Delete Confirmation Modal
    deleteConfirmTitle: 'Delete This Transaction?',
    deleteConfirmWarning:
      'This transaction will be permanently removed from Google Sheets and cannot be undone.',
    deleteDialogTitle: 'Delete Transaction?',
    deleteDialogDeleting: 'Deleting Transaction...',
    deleteDialogSuccess: 'Deleted Successfully!',
    deleteDialogDesc:
      'The transaction will be deleted from the app and the row in your Google Sheets will be neatly removed without empty gaps.',
    deleteDialogDescDeleting: 'Removing data from system and tidying your Google Sheets...',
    deleteDialogDescSuccess: 'Transaction and rows in Google Sheets have been neatly updated.',
    fieldMerchant: 'Merchant',
    fieldAmount: 'Amount',
    fieldCategory: 'Category',
    fieldDate: 'Date',
    loadingDone: 'Done',
    btnCancel: 'Cancel',
    btnConfirmDelete: 'Yes, Delete',
    deletingStatus: 'Deleting...',
    deletingFromSheets: 'Deleting from Google Sheets...',
    deleteSuccess: 'Transaction Deleted Successfully',
    deleteFailed: 'Failed to delete transaction',
    deleteTxAria: 'Delete transaction {merchant}',

    // Manual Entry Card
    manualTitle: 'Record Expense',
    manualSub: 'Data is written directly to your personal Google Sheets',
    labelAmount: 'TRANSACTION AMOUNT (RP)',
    placeholderAmount: 'E.g.: 50,000',
    labelMerchant: 'STORE / MERCHANT NAME',
    placeholderMerchant: 'E.g.: Starbucks, Grocery, Train',
    labelCategory: 'CATEGORY',
    labelDate: 'DATE',
    btnToday: 'Today',
    labelPayment: 'PAYMENT METHOD',
    labelNote: 'NOTE (OPTIONAL)',
    placeholderNote: 'E.g.: Coffee with team, weekly grocery...',
    btnSubmitManual: 'Record Expense',
    submittingManual: 'Saving to Sheets...',
    errMerchantRequired: 'Merchant or place name is required',
    errAmountPositive: 'Transaction amount must be greater than Rp 0',
    manualSuccessMsg: 'Successfully recorded {amount} for {merchant} to Google Sheets!',
    manualBackTapTipTitle: '💡 Want automatic tracking without filling forms?',
    manualBackTapTipDesc:
      'Use the iPhone Back Tap Shortcut to capture receipts or bank alerts in 2 seconds directly to Google Sheets.',
    amountInterpreted: 'Interpreted: {amount}',
    viewInTxTab: 'View in Transactions Tab',
    errSaveFailed: 'Failed to record transaction',
    errSystemError: 'A system error occurred. Please try again later.',

    // Device Setup Banner
    deviceBannerTitle: 'Shortcut Not Connected',
    deviceBannerTag: '1-Click',
    deviceBannerDescPrefix: 'Enable iPhone Back Tap & choose',
    deviceBannerDescStrong: 'Always Allow',
    deviceBannerAction: 'Connect',
    deviceBannerAria: 'Connect iPhone Shortcut Now',

    // Shortcut Onboarding Modal
    onboardingModalTitle: 'Install iPhone Shortcut',
    onboardingModalSub: 'Hello {name}, set up automatic integration',
    onboardingModalDescPart1: 'This app records expenses directly from iPhone screenshots via',
    onboardingModalDescStrong: 'Back Tap',
    onboardingModalDescPart2: 'in 2 seconds.',
    onboardingWarningTitle: 'Required: Choose "Always Allow"',
    onboardingWarningDesc: 'When iPhone prompts for network permissions for the first time:',
    onboardingWarningAction: '👉 Choose: Always Allow',
    onboardingWarningNote:
      'Make sure not to select "Don\'t Allow" so expense receipts to your Google Sheets aren\'t blocked by iOS.',
    btnInstallNow: 'Install Now (1-Click)',
    btnLater: 'Maybe Later',
    closePrompt: 'Close prompt',

    // Retry Sheet Card
    sheetNotConnected: 'Google Sheet not connected',
    sheetNotConnectedDesc: 'Transaction spreadsheet was not finished during previous login.',
    btnRetrySheet: 'Retry connecting Google Sheet',
    btnRetrySheetAction: 'Reconnect',
    btnRetryingSheet: 'Connecting...',
    errCreateSheet: 'Failed to create Google Sheet. Please try again.',
    errNetwork: 'Network error occurred. Please try again.',
    creatingSpreadsheet: 'Creating spreadsheet...',
    tryAgain: 'Try again',

    // Modals
    modalSettingsTitle: 'Settings',
    labelGoogleAccount: 'Google Account',
    labelGoogleSheets: 'Google Spreadsheet',
    linkOpenSheets: 'Open Personal Google Sheets →',
    labelIphoneShortcut: 'iPhone Shortcut (Back Tap)',
    linkSetupShortcut: 'Connect / Reinstall Shortcut →',
    btnClose: 'Close',

    modalHelpTitle: 'Help & Guides',
    guideBackTapTitle: '⚡ How to Record with Back Tap',
    guideBackTapText:
      '1. Take a screenshot of your receipt/payment on iPhone.\n2. Double-tap the back of your iPhone.\n3. AI automatically extracts the transaction into Google Sheets & this Dashboard!',
    guidePwaTitle: '📱 Add to Home Screen',
    guidePwaText:
      '1. Open this website in Safari on iPhone.\n2. Tap the Share button.\n3. Choose "Add to Home Screen".',
    btnGotIt: 'Got it',

    modalFeedbackTitle: 'Send Feedback',
    placeholderFeedback: 'Write suggestions or issues you encountered...',
    btnSendFeedback: 'Send Feedback',
    feedbackThanks: 'Thank you for your feedback!',

    // Pair Page Header & Navigation
    pairTitle: 'Device Settings',
    pairSubtitle: 'Connect iPhone and manage Shortcut access',
    backToDashboard: 'Back to Dashboard',

    // Direct Setup Card
    directSetupTitle: 'Optional: Back Tap Only (Receipt Photos)',
    directSetupDesc:
      'Specifically for users who want to record expenses by double-tapping the iPhone back to capture physical receipts or transfer screenshots.',
    labelDeviceName: 'Device Label',
    placeholderDeviceName: "e.g. Rico's iPhone",
    defaultDevicePrefix: 'iPhone',
    defaultDeviceSuffix: 'My',
    privateAndSecure: 'Private & Secure:',
    privateAndSecureDesc:
      'Each device has an encrypted unique token and only writes transactions to your account Google Sheets.',
    btnCreateAccess: 'Create iPhone Access (1-Click)',
    btnCreatingAccess: 'Setting up Access...',
    errCreateAccess: 'Failed to create device access',
    errNetworkConnect: 'Network issue while connecting',
    setupSuccessTitle: 'iPhone Access Created Successfully!',
    autoConnectBoxTitle: 'Connect to iPhone Automatically (1-Click)',
    autoConnectBoxDesc:
      'Tap the button below. Your iPhone will immediately open Shortcuts and link your account automatically without typing anything.',
    btnConnectNow: '⚡ Connect to iPhone Now',
    btnInstallFromIcloud: "📲 Don't have the shortcut yet? Install from iCloud",
    backTapReminderTitle: "💡 Don't Forget: Set Up Back Tap on iPhone",
    backTapReminderDesc:
      'Open Settings > Accessibility > Touch > Back Tap > select Finance Tracker on Double Tap.',
    showManualDetails: 'Want to Copy Token / Endpoint Manually?',
    hideManualDetails: 'Hide Technical Details',
    captureEndpointUrl: 'Capture Endpoint URL:',
    secretDeviceToken: 'Secret Device Token:',
    connectAnotherDevice: 'Connect Another Device',

    // Shortcut Guide Card
    guideCardTitle: 'Shortcuts & Back Tap Guide',
    guideStep1Title: 'Tap "Install & Connect Shortcut" Above',
    guideStep1Desc:
      'Just tap the button above once. Your iPhone will automatically open the official "Add Shortcut" screen.',
    guideStep2Title: 'Tap "Connect to iPhone Automatically"',
    guideStep2Desc:
      'Simply tap the button once. Your iPhone will automatically open Shortcuts and link your account instantly without typing anything.',
    guideStep3Title: 'Select "Always Allow"',
    guideStep3Desc:
      'When the shortcut runs for the first time on iPhone, iOS requests network permission: make sure to select Always Allow so receipt submissions are never blocked.',
    guideStep4Title: 'Configure Back Tap',
    guideStep4Desc:
      'Open iPhone Settings → Accessibility → Touch → Back Tap → select Finance Tracker on Double Tap.',
    guideDoneTip:
      'All set! Whenever you see a receipt or transfer proof on your iPhone, simply double tap the back of your iPhone to automatically record the expense into Google Sheets.',

    // Device List
    connectedDevicesTitle: 'Connected Devices ({count})',
    noDevicesConnected: 'No iPhone connected yet.',
    lastActive: 'Last active:',
    connectedAt: 'Connected:',
    btnRevoke: 'Revoke',
    confirmRevoke: 'Are you sure you want to revoke access for this device?',
    errRevokeDevice: 'Failed to revoke device',
    errNetworkRevoke: 'Network issue occurred',
    revokeAriaLabel: 'Revoke access for {label}',

    // Setup Gate
    setupGateTitle: 'Install iPhone Shortcut',
    setupGateSubtitle:
      'Hello {name}! Install the Finance Tracker shortcut on your iPhone to start recording expenses automatically to your personal Google Sheets.',
    setupGateSelectModePrompt: 'Choose How You Track Transactions:',
    setupGateModeNotifTitle: 'Auto Bank Notifications',
    setupGateModeNotifBadge: 'Recommended',
    setupGateModeNotifDesc:
      'Whenever you pay via QRIS or receive bank transfers (BCA, Livin, BRImo, GoPay, etc.), transactions are logged automatically without opening the app.',
    setupGateModeBacktapTitle: 'Back Tap Receipt Photo',
    setupGateModeBacktapBadge: 'Physical Receipt Photo',
    setupGateModeBacktapDesc:
      'Double-tap iPhone back to snap physical receipts, paper bills, or transfer screenshots. Gemini AI extracts items & totals.',
    setupGateNotifQuickGuideTitle: 'Quick Guide for Bank Notifications:',
    setupGateNotifGuideItem1: 'Tap the "Install Notification Shortcut" button below.',
    setupGateNotifGuideItem2: 'iPhone will prompt: tap Add Shortcut.',
    setupGateNotifGuideItem3: 'Account token connects automatically, ready for your automation trigger.',
    setupGateNotifBtnInstall: 'Install Notification Shortcut (1-Click)',
    setupGateBacktapQuickGuideTitle: 'Quick Guide for Back Tap Receipts:',
    setupGateBacktapGuideItem1: 'Tap the "Install Back Tap Shortcut" button below.',
    setupGateBacktapGuideItem2: 'iPhone will prompt: tap Add Shortcut.',
    setupGateBacktapGuideItem3: 'Account token connects automatically, ready for Back Tap setup.',
    setupGateBacktapBtnInstall: 'Install Back Tap Shortcut (1-Click)',
    badgeOptional: 'OPTIONAL',
    setupGateActiveNotifTitle: 'Final Step on iPhone: Enable Notification Automation',
    setupGateActiveNotifStep1:
      'Open Automation tab in iPhone Shortcuts app → Tap (+).',
    setupGateActiveNotifStep2:
      'Choose Notification trigger from your bank apps (BCA, Livin, BRImo, GoPay, etc.).',
    setupGateActiveNotifStep3:
      'Choose action Run Shortcut → Select Finance Tracker → Turn on "Run Immediately". Done!',
    setupGateActiveBacktapTitle: 'Final Step on iPhone: Enable Back Tap',
    setupGateActiveBacktapStep1:
      'Open iPhone Settings → Accessibility → Touch → Back Tap.',
    setupGateActiveBacktapStep2: 'Select Double Tap or Triple Tap.',
    setupGateActiveBacktapStep3:
      'Scroll down to Shortcuts section → Check "Finance Tracker". Done!',
    setupGateDualSupportTip:
      '💡 Tip: One shortcut supports both! You can enable both Notifications and Back Tap on your iPhone anytime.',
    setupGateReadyTitle: 'Ready to Connect to iPhone!',
    setupGateReadySub: 'Automatic connection directly to Google Sheets ({email})',
    setupGateStepTitle: '1-Click Automatic Step:',
    setupGateStepDesc:
      'Tap the button below. Your iPhone will automatically open Shortcuts and save your account connection without typing anything.',
    setupGateBtnConnectAuto: 'Connect to iPhone Automatically',
    setupGateNotInstalledYet: "Don't have the shortcut on iPhone yet? Install once:",
    setupGateBtnInstallIcloud: 'Install Shortcut (iCloud)',
    setupGateBtnFinishDashboard: 'Finish & Open Dashboard',
    setupGateQuickGuideTitle: 'Quick Instructions on iPhone Screen:',
    setupGateGuideItem1: 'Tap the "Install & Connect Shortcut" button below.',
    setupGateGuideItem2: 'iPhone will open a prompt: tap Add Shortcut.',
    setupGateGuideItem3: 'When running for the first time, select: Always Allow.',
    setupGateBtnInstall1Click: 'Install & Connect Shortcut (1-Click)',
    setupGateBtnInstalling: 'Connecting...',
    setupGateSkipWithoutIphone: 'Continue to Dashboard without iPhone',
    setupGateLogout: 'Log out',

    // PWA Guide Card
    pwaGuideCardTitle: 'Add to iPhone Home Screen',
    pwaGuideCardSub: 'Quick access without Safari address bar',
    pwaStep1Title: 'Tap Share',
    pwaStep1Desc: 'Press the square icon with an upward arrow in Safari bottom toolbar.',
    pwaStep2Title: 'Select "Add to Home Screen"',
    pwaStep2Desc: 'Scroll down the options menu until you find this option.',
    pwaStep3Title: 'Tap "Add"',
    pwaStep3Badge: 'Add',
    pwaStep3Desc:
      'Button in the top right corner. The app icon will appear directly on your home screen.',
    pwaCallout:
      'The app will open in full screen without the Safari toolbar and without cluttering browser tabs.',
    guideBadge: 'Guide',
    closeSuggestion: 'Dismiss suggestion',

    // Toast
    switchedToEnglish: '🇬🇧 Switched to English (Amounts remain in Rupiah)',
    switchedToIndonesian: '🇮🇩 Switched to Indonesian',

    // Login Page
    loginDriveNoticeBadge: 'Important on Sign-In',
    loginDriveNoticeTitle: 'Must Tick Google Drive Permission',
    loginDriveNoticeDesc:
      'On the next Google screen, make sure to tick the Google Drive permission checkbox so Finance Tracker can automatically create your Google Sheets for tracking finances.',
    loginCheckboxSample:
      'See, edit, create, and delete only the specific Google Drive files you use with this app',
    loginCheckboxWarning:
      'If this box is not checked, your transaction spreadsheet cannot be created.',
    loginPermissionSummary:
      'Requested access: email and Google account profile, and creating a new spreadsheet in your Google Drive. We do not read any other files in your Drive.',
    loginBtnGoogle: 'Continue with Google',
    loginConnecting: 'Connecting...',
    loginTermsNotice: 'By continuing, you agree to our',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    loginError: 'Failed to connect to Google. Please try again.',

    // Notification Guide Card
    notifGuideBadge: 'RECOMMENDED',
    notifGuideTitle: 'Auto-Log Bank & QRIS Notifications',
    notifGuideSub: 'Most effortless — logged automatically without opening the app (< 0.5s)',
    notifGuideSummary:
      'Whenever you pay via QRIS or receive bank transfers in BCA, Mandiri, BRI, GoPay, etc., iPhone silently records it to your personal Google Sheets.',
    notifGuideBtnInstall: 'Install Notification Shortcut (1-Click)',
    notifGuideBtnInstalling: 'Installing Shortcut...',
    notifGuideBtnInstalled: 'Shortcut Connected! Re-install?',
    notifStep1Title: 'Install Shortcut Automatically',
    notifStep1Desc:
      'Tap "Install Notification Shortcut (1-Click)" above. The official Finance Tracker shortcut installs and configures your account token automatically on your iPhone.',
    notifStep2Title: 'Create Notification Automation on iPhone',
    notifStep2Desc:
      'Open Automation tab in iPhone Shortcuts app → Tap (+) → Choose Notification trigger from your banking or e-wallet apps (BCA, Livin, GoPay, etc.).',
    notifStep3Title: 'Choose Action "Run Shortcut"',
    notifStep3Desc:
      'Choose action Run Shortcut → Select Finance Tracker → Turn on "Run Immediately". Done!',
    notifTipsDesc:
      '100% Automatic: No need to manually type URLs, tokens, or webhooks. Everything is pre-configured in the shortcut.',
    notifCloseGuideAria: 'Close notification guide',
    notifOpenGuideAria: 'Open notification guide',

    // Wallet Section & Cards
    walletBalance: 'Wallet Balance',
    walletCardsCount: '{count} active cards saved',
    walletTitle: 'Wallets',
    walletStackCards: 'Stack cards',
    walletExpandCards: 'Expand all cards',
    walletShowBalanceAria: 'Show balance',
    walletHideBalanceAria: 'Hide balance',
    walletMenuAria: 'Wallet menu options',
    walletReloadAll: 'Reset All Banks',
    walletAddNew: 'Add New Card',
    walletEmptyTitle: 'Add your first wallet card',
    walletActiveCard: 'ACTIVE CARD',
    walletTapToSelect: 'Tap to select card',
    walletTapToEdit: 'Tap to edit card',
    walletEdit: 'Edit',
    walletDelete: 'Delete',
    walletAddCash100k: '+100k',
    walletAddCash500k: '+500k',
    walletAddCash1m: '+1M',

    // Wallet Modal
    walletModalAddTitle: 'Add New Card',
    walletModalEditTitle: 'Edit Card',
    walletModalSub: 'Manage your bank cards & e-wallets',
    walletModalCardNameLabel: 'CARD / BANK NAME',
    walletModalCardNamePlaceholder: 'e.g. BCA Platinum, Chase Sapphire',
    walletModalBalanceLabel: 'CURRENT BALANCE',
    walletModalBalancePlaceholder: 'Rp 0',
    walletModalLastDigitsLabel: 'LAST 4 DIGITS (OPTIONAL)',
    walletModalLastDigitsPlaceholder: 'e.g. 8821',
    walletModalAppearanceLabel: 'ISSUER & APPEARANCE',
    walletModalStandardBank: 'Elegant Banking Standards',
    walletModalTabConventional: 'Conventional Bank',
    walletModalTabDigital: 'Digital & E-Wallet',
    walletModalTabCustom: 'Custom / Metal',
    walletModalCustomColorLabel: 'Select Elegant Shade',
    walletModalColorPickerTitle: 'Custom Color Picker',
    walletModalColorPickerSub: 'Tap circle to open color wheel',
    walletModalCancel: 'Cancel',
    walletModalSave: 'Save Changes',
    walletModalAdd: 'Add Card',
    walletModalSaveAdd: 'Save New Card',
    walletModalSaveEdit: 'Update Balance',
    walletModalSectionMetal: 'METAL & SPECIAL EDITIONS',
    walletModalSectionSwatches: 'ELEGANT COLOR SWATCHES',
    navDashboardTabsAria: 'Dashboard navigation options',
  },
} as const

export type TranslationKey = keyof typeof translations.id

export const categoryTranslations: Record<string, { id: string; en: string }> = {
  'Makanan & Minuman': { id: 'Makanan & Minuman', en: 'Food & Beverage' },
  Transportasi: { id: 'Transportasi', en: 'Transportation' },
  Belanja: { id: 'Belanja', en: 'Shopping' },
  'Tagihan & Utilitas': { id: 'Tagihan & Utilitas', en: 'Bills & Utilities' },
  Hiburan: { id: 'Hiburan', en: 'Entertainment' },
  Kesehatan: { id: 'Kesehatan', en: 'Healthcare' },
  'Transfer Antar Bank': { id: 'Transfer Antar Bank', en: 'Bank Transfer' },
  Lainnya: { id: 'Lainnya', en: 'Others' },
}

export const paymentMethodTranslations: Record<string, { id: string; en: string }> = {
  QRIS: { id: 'QRIS', en: 'QRIS' },
  'Transfer BCA': { id: 'Transfer BCA', en: 'BCA Transfer' },
  'Transfer Mandiri': { id: 'Transfer Mandiri', en: 'Mandiri Transfer' },
  'Kartu Debit': { id: 'Kartu Debit', en: 'Debit Card' },
  Tunai: { id: 'Tunai', en: 'Cash' },
  Lainnya: { id: 'Lainnya', en: 'Others' },
}
