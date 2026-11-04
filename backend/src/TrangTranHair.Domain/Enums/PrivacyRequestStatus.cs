namespace TrangTranHair.Domain.Enums;

public enum PrivacyRequestStatus
{
    Submitted = 0,
    IdentityVerificationRequired = 1,
    UnderReview = 2,
    MoreInformationRequired = 3,
    Approved = 4,
    Rejected = 5,
    Completed = 6,
}
